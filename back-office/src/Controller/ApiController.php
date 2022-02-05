<?php
/**
 * Controller providing the API for accessing the data via HTTP
 *
 * @author Morgan Van Amerongen
 * @version 1.0.0
 */

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

use Doctrine\ORM\QueryBuilder;
use App\Entity\Echouage;
use App\Entity\Espece;

/**
 * @Route("/api/v1", name="api_v1")
 */
class ApiController extends AbstractController {
    /**
     * @Route("/echouages", name="get_echouages", methods={"GET"})
     */
    public function get_echoauges(Request $request): Response {
        // Get all the possible parameters
        $start  = $request->query->get("start");
        $end    = $request->query->get("end");
        $espece = $request->query->get("espece");
        $zone   = $request->query->get("zone");

        // If no parameters are passed, fetch all echouages
        if (!$start && !$end && !$espece && !$zone) {
            return $this->get_all_echoauges();
        }

        // If a parameter isn't a number, the request isn't valid
        foreach (array($start, $end, $zone) as $param) {
            if ($param && !is_numeric($param)) {
                return $this->error(400, "Start, end and zone must all parameters should be numbers");
            }
        }

        $query = $this
            ->getDoctrine()
            ->getManager()
            ->createQueryBuilder()
            ->select("e")
            ->from(Echouage::Class, "e");

        try {
            // Pass the QueryBuilder around to filter the query with the given parameters
            $query = $this->start_date($query, $start);
            $query = $this->end_date($query, $end);
            $query = $this->espece($query, $espece);
            $query = $this->zone($query, $zone);

            $echouages = $query->getQuery()->getResult();
            return $this->success(json_encode($echouages));
        } catch (Exception $e) {
            return $this->error(500, $e->getMessage());
        }
    }

    /**
     * @Route("/especes", name="get_especes", methods={"GET"})
     */
    public function get_especes(Request $request): Response {
        $search = $request->query->get("search");
        $em = $this->getDoctrine()->getManager();

        if (!$search) {
            $especes = $em->getRepository(Espece::Class)->findAll();
            return $this->success(json_encode($especes));
        }

        // Filter the especes by name
        $query = $em
            ->createQueryBuilder()
            ->select("e")
            ->from(Espece::Class, "e")
            ->where("LOWER(e.espece) LIKE :pattern")
            ->setParameter("pattern", sprintf("%%%s%%", strtolower($search)));

        $especes = $query->getQuery()->getResult();
        return $this->success(json_encode($especes));
    }

    public function zone(QueryBuilder $query, ?string $zone): QueryBuilder {
        if ($zone && is_numeric($zone)) {
            return $query
                ->andWhere("e.zone = :zone_id")
                ->setParameter(":zone_id", intval($zone));
        }

        return $query;
    }

    public function espece(QueryBuilder $query, ?string $espece): QueryBuilder {
        if ($espece) {
            // Sort espece by ID
            if (is_numeric($espece)) {
                return $query
                    ->andWhere("e.espece = :espece_id")
                    ->setParameter(":espece_id", $espece);
            }

            // Sort espece by name
            return $query
                ->join("e.espece", "esp", "WITH", "e.espece = esp.id")
                ->andWhere("LOWER(esp.espece) = :espece_name")
                ->setParameter(":espece_name", strtolower($espece));
        }

        return $query;
    }

    public function end_date(QueryBuilder $query, ?string $end): QueryBuilder {
        if ($end && is_numeric($end)) {
            return $query
                ->andWhere("e.date <= :end")
                ->setParameter(":end", intval($end));
        }

        return $query;
    }

    public function start_date(QueryBuilder $query, ?string $start): QueryBuilder {
        if ($start && is_numeric($start)) {
            return $query
                ->andWhere("e.date >= :start")
                ->setParameter(":start", intval($start));
        }

        return $query;
    }

    public function get_all_echoauges(): Response {
        $echouages = $this
            ->getDoctrine()
            ->getManager()
            ->getRepository(Echouage::Class)
            ->findAll();

        return $this->success(json_encode($echouages));
    }

    public function success(string $data): Response {
        $response = new Response();

        $response->setContent($data);
        $response->setStatusCode(200);

        $response->headers->set("Content-Type", "application/json");
        $response->headers->set("Access-Control-Allow-Origin", "*");

        return $response;
    }

    public function error(int $status_code, string $message): Response {
        $response = new Response();

        $response->setContent(json_encode(array("error" => $message)));
        $response->setStatusCode($status_code);

        $response->headers->set("Content-Type", "application/json");
        $response->headers->set("Access-Control-Allow-Origin", "*");

        return $response;
    }
}
