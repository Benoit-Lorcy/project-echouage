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
 * @Route("/", name="back_office_")
 */
class BackOfficeController extends AbstractController {
    /**
     * @Route("/", name="root")
     */
    public function root_to_index(): Response {
        return $this->redirectToRoute("back_office_index", [], 301);
    }

    /**
     * @Route("/back-office", name="index")
     */
    public function index(Request $request, ?string $error_message): Response {
        $em = $this->getDoctrine()->getManager();

        $especes = $em->getRepository(Espece::Class)->findAll();
        $zones = $em->getRepository(Zone::Class)->findAll();

        return $this->render("back_office/index.html.twig", [
            "controller_name" => "BackOfficeController",
            "especes" => $especes,
            "zones" => $zones,
            "error_message" => $error_message,
        ]);
    }

    /**
     * @Route("/back-office/show_data", name="show_data")
     */
    public function show_data(Request $request): Response {
        $espece_id = intval($request->query->get("espece"));
        $zone_id = $request->query->get("zone");
        $take_no_entry_into_account = $request->query->get("take_no_entry_into_account");

        $em = $this->getDoctrine()->getManager();

        $echouages = $em
            ->getRepository(Echouage::Class)
            ->find_by_espece_and_zone_ids_grouped_by_date($espece_id, is_numeric($zone_id) ? $zone_id : null);

        $espece = $em->getRepository(Espece::Class)->findOneBy(["id" => $espece_id]);

        // If the espece is null, an invalid ID has been submitted
        // This error should only be emitted if the client has modified
        // the client side form validation
        if (!$espece) {
            return $this->redirectToRoute("back-office-index", [
                "error_message" => "ID de l'espèce invalide",
            ]);
        }

        // Fetch one or all Zone
        $zones = is_numeric($zone_id)
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

        $summary_data = $this->compute_echouage_stats($echouage_data, $zones, $take_no_entry_into_account);

        return $this->render("back_office/show_data.html.twig", [
            "espece" => $espece,
            "zones" => $zones,
            "echouages" => $echouage_data,
            "summary_data" => $summary_data,
            "take_no_entry_into_account" => $take_no_entry_into_account,
        ]);
    }

    function compute_echouage_stats(
        array $echouage_data,
        array $zones,
        int $take_no_entry_into_account
    ): array {
        // Compute the min, max and average Echouage by Zone
        $summary_data = array();

        foreach ($zones as $zone) {
            $summary_data[$zone->getId()] = array(
                "min" => INF,
                "max" => 0,
                "avg" => 0,
                "nb_data" => 0
            );
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

                $summary_data[$zone_id]["nb_data"] += 1;
                $summary_data[$zone_id]["avg"] += $nb;
            }
        }

        foreach ($zones as $zone) {
            // Prevent division by 0
            if ($summary_data[$zone->getId()]["nb_data"] > 0) {
                $summary_data[$zone->getId()]["avg"] /= $summary_data[$zone->getId()]["nb_data"];
            }
        }

        return $summary_data;
    }
}
