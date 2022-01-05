<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

use App\Entity\Echouage;

/**
 * @Route("/api/v1", name="api_v1")
 */
class ApiController extends AbstractController {
    /**
     * @Route("/echouages", name="get_all_echouages", methods={"GET"})
     */
    public function get_all_echoauges(): Response {
        $em = $this->getDoctrine()->getManager();
        $echouages = $em->getRepository(Echouage::Class)->findAll();

        $response = new Response();

        $response->setContent(json_encode($echouages));
        $response->headers->set("Content-Type", "application/json");
        $response->headers->set("Access-Control-Allow-Origin", "*");
        return $response;
    }

    public function filter_echouages(Request $request): Response {
        
    }
}