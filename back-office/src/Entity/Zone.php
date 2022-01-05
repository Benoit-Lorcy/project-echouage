<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Zone
 *
 * @ORM\Table(name="zone")
 * @ORM\Entity(repositoryClass="App\Repository\ZoneRepository")
 */
class Zone implements \JsonSerializable {
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="zone", type="string", length=50, nullable=false)
     */
    private $zone;

    public function getId(): ?int {
        return $this->id;
    }

    public function getZone(): ?string {
        return $this->zone;
    }

    public function setZone(string $zone): self {
        $this->zone = $zone;

        return $this;
    }

    public function __toString(): string {
        return $this->zone;
    }

    public function jsonSerialize(): array {
        return array(
            "id" => $this->id,
            "zone" => $this->zone,
        );
    }
}