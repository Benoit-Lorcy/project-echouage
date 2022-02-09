<?php
/**
 * Repository de l'entité Echoauge
 *
 * @author Morgan Van Amerongen
 * @version 1.0.0
 */

namespace App\Repository;

use App\Entity\Echouage;
use App\Entity\Zone;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Echouage|null find($id, $lockMode = null, $lockVersion = null)
 * @method Echouage|null findOneBy(array $criteria, array $orderBy = null)
 * @method Echouage[]    findAll()
 * @method Echouage[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EchouageRepository extends ServiceEntityRepository {
    public function __construct(ManagerRegistry $registry) {
        parent::__construct($registry, Echouage::class);
    }

    public function find_by_espece_and_zone_ids_grouped_by_date(int $espece_id, ?int $zone_id): array {
        // Create the query to fetch the Echouages with the
        // wanted constraints (given via the parameters),
        // grouped by date.
        $query = $this->getEntityManager()
            ->createQueryBuilder()
            ->select("e.date, z.id, SUM(e.nombre)")
            ->from(Echouage::Class, "e")
            ->join(Zone::Class, "z", "WITH", "e.zone = z.id")
            ->where("e.espece = :espece_id")
            ->setParameter(":espece_id", $espece_id);

        if ($zone_id) {
            $query = $query
                ->andWhere("e.zone = :zone_id")
                ->setParameter(":zone_id", $zone_id);
        }

        return $query
            ->groupBy("e.date")
            ->getQuery()
            ->getResult();
    }

    // /**
    //  * @return Echouage[] Returns an array of Echouage objects
    //  */
    /*
    public function findByExampleField($value) {
        return $this->createQueryBuilder('e')
            ->andWhere('e.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('e.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Echouage {
        return $this->createQueryBuilder('e')
            ->andWhere('e.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
