<?php

namespace App\Controller;

use App\Entity\Espece;
use App\Form\EspeceType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/espece")
 */
class EspeceController extends AbstractController
{
    /**
     * @Route("/", name="espece_index", methods={"GET"})
     */
    public function index(EntityManagerInterface $entityManager): Response
    {
        $especes = $entityManager
            ->getRepository(Espece::class)
            ->findAll();

        return $this->render('espece/index.html.twig', [
            'especes' => $especes,
        ]);
    }

    /**
     * @Route("/new", name="espece_new", methods={"GET", "POST"})
     */
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        $espece = new Espece();
        $form = $this->createForm(EspeceType::class, $espece);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($espece);
            $entityManager->flush();

            return $this->redirectToRoute('espece_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('espece/new.html.twig', [
            'espece' => $espece,
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/{id}", name="espece_show", methods={"GET"})
     */
    public function show(Espece $espece): Response
    {
        return $this->render('espece/show.html.twig', [
            'espece' => $espece,
        ]);
    }

    /**
     * @Route("/{id}/edit", name="espece_edit", methods={"GET", "POST"})
     */
    public function edit(Request $request, Espece $espece, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(EspeceType::class, $espece);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('espece_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('espece/edit.html.twig', [
            'espece' => $espece,
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/{id}", name="espece_delete", methods={"POST"})
     */
    public function delete(Request $request, Espece $espece, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$espece->getId(), $request->request->get('_token'))) {
            $entityManager->remove($espece);
            $entityManager->flush();
        }

        return $this->redirectToRoute('espece_index', [], Response::HTTP_SEE_OTHER);
    }
}
