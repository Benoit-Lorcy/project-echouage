<?php
/**
 * Controller for the back-office. Controls access
 * to the main page (AKA the search page) and the
 * data page.
 *
 * @author Morgan Van Amerongen
 * @version 1.0.0
 */

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

        $especes = $em->getRepository(Espece::Class)->findAll();
        $zones = $em->getRepository(Zone::Class)->findAll();

        return $this->render("back_office/index.html.twig", [
            "controller_name" => "BackOfficeController",
            "especes" => $especes,
            "zones" => $zones,
        ]);
    }

    /**
     * @Route("/show_data", name="show_data")
     */
    public function show_data(Request $request): Response {
        $espece_id = intval($request->query->get("espece"));
        $zone_id = $request->query->get("zone");
        $take_no_entry_into_account = $request->query->get("take_no_entry_into_account");

        if (!is_numeric($zone_id)) {
            $zone_id = -1;
        }

        // Create the query to fetch the Echouages with the 
        // wanted constraints (given via the parameters),
        // grouped by date.
        $em = $this->getDoctrine()->getManager();

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

        // Fetch the name of the wanted Espece
        $espece = $em->getRepository(Espece::Class)->findOneBy(["id" => $espece_id]);
        // Fetch one or all Zone
        $zones = $zone_id >= 0
            ? $em->getRepository(Zone::Class)->findBy(["id" => $zone_id])
            : $em->getRepository(Zone::Class)->findAll();

        // Parse the data so it's easier to show it as an HTML table
        $echouage_data = array();
        foreach ($echouages as $res) {
            // If the date was never recorded, set echouage for all zones to 0
            if (!array_key_exists($res["date"], $echouage_data)) {
                $echouage_data[$res["date"]] = array();

                foreach ($zones as $zone) {
                    $echouage_data[$res["date"]][$zone->getId()] = 0;
                }
            }
 
            // Set the echouage of the current year and zone to the fetched echouage_data
            $echouage_data[$res["date"]][$res["id"]] = $res[1];
        }


        // Compute the min, max and average Echouage by Zone
        $summary_data = array();
        $nb_data = 0;

        foreach ($zones as $zone) {
            $summary_data[$zone->getId()] = array("min" => INF, "max" => 0, "avg" => 0);
        }

        foreach ($echouage_data as $date => $data) {
            foreach ($data as $zone_id => $nb) {
                if ($nb == 0 && !$take_no_entry_into_account) {
                    continue;
                }

                if ($nb < $summary_data[$zone_id]["min"]) {
                    $summary_data[$zone_id]["min"] = $nb;
                }

                if ($nb > $summary_data[$zone_id]["max"]) {
                    $summary_data[$zone_id]["max"] = $nb;
                }

                $nb_data += 1;
                $summary_data[$zone_id]["avg"] += $nb;
            }
        }

        // Prevent division by 0
        if ($nb_data > 0) {
            foreach ($zones as $zone) {
                $summary_data[$zone->getId()]["avg"] /= $nb_data;
            }
        }

        return $this->render("back_office/show_data.html.twig", [
            "espece" => $espece,
            "zones" => $zones,
            "echouages" => $echouage_data,
            "summary_data" => $summary_data,
            "take_no_entry_into_account" => $take_no_entry_into_account,
        ]);
    }
}
