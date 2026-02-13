import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import staff1 from "@/assets/staff-1.jpg";
import staff2 from "@/assets/staff-2.jpg";
import staff3 from "@/assets/staff-3.jpg";

interface StaffMember {
  name: string;
  role: string;
  image: string;
  link: string;
}

const Staff = () => {
  const staffMembers: StaffMember[] = [
    {
      name: "Alex_Crafter",
      role: "Fondatore & CEO",
      image: staff1,
      link: "https://namemc.com",
    },
    {
      name: "Steve_Builder",
      role: "Responsabile Produzione",
      image: staff2,
      link: "https://namemc.com",
    },
    {
      name: "Elder_Miner",
      role: "Esperto Risorse",
      image: staff3,
      link: "https://namemc.com",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 font-serif text-4xl font-bold text-foreground">Il Nostro Staff</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Conosci il team di professionisti che rende Purissima™ la migliore azienda nel mondo Minecraft.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {staffMembers.map((member, index) => (
          <Card 
            key={index} 
            className="group overflow-hidden border-border bg-card transition-all hover:shadow-lg"
          >
            <CardContent className="flex flex-col items-center p-6">
              <div className="mb-4 overflow-hidden rounded-lg">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-48 w-48 object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <h3 className="text-lg font-bold text-card-foreground">{member.name}</h3>
              <p className="mb-3 text-sm text-muted-foreground">{member.role}</p>
              <a
                href={member.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary transition-colors hover:underline"
              >
                Profilo NameMC
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Staff;
