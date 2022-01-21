<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

use App\Entity\Zone;
use App\Entity\Espece;
use App\Entity\Echouage;

/**
 * @Route("/back-office", name="back_office")
 */
class BackOfficeController extends AbstractController {
    /**
     * @Route("/", name="back_office_index")
     */
    public function index(Request $request): Response {
        $em = $this->getDoctrine()->getManager();

        $espece_id = $request->query->get("espece");
        $zone_id = $request->query->get("zone");

        if (!$zone_id && !$espece_id) {
            $especes = $em->getRepository(Espece::Class)->findAll();
            $zones = $em->getRepository(Zone::Class)->findAll();

            return $this->render("back_office/index.html.twig", [
                "controller_name" => "BackOfficeController",
                "especes" => $especes,
                "zones" => $zones,
            ]);
        }

        $zone_id = intval($zone_id);
        $espece_id = intval($espece_id);

        $query = $em->createQueryBuilder()
            ->select("e.date, z.id, SUM(e.nombre)")
            ->from(Echouage::Class, "e")
            ->join(Zone::Class, "z", "WITH", "e.zone = z.id")
            ->where("e.espece = :espece_id")
            ->setParameter(":espece_id", $espece_id);

        if ($zone_id >= 0) {
            $query = $query
                ->andWhere("e.zone = :zone_id")
                ->setParameter(":zone_id", $zone_id);
        }

        $echouages = $query
            ->groupBy("e.date")
            ->getQuery()
            ->getResult();

        $espece = $em->getRepository(Espece::Class)->findBy(["id" => $espece_id]);
        $zones = $zone_id > 0
            ? $em->getRepository(Zone::Class)->findBy(["id" => $zone_id])
            : $em->getRepository(Zone::Class)->findAll();

        $data = array();
        foreach ($echouages as $res) {
            if (!array_key_exists($res["date"], $data)) {
                $data[$res["date"]] = array();

                foreach ($zones as $zone) {
                    $data[$res["date"]][$zone->getId()] = 0;
                }
            }
 
            $data[$res["date"]][$res["id"]] = $res[1];
        }

        return $this->render("back_office/show_data.html.twig", [
            "espece" => $espece[0],
            "zones" => $zones,
            "echouages" => $data,
        ]);
    }
}
