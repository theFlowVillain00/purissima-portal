import heroBg from "@/assets/hero-bg.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

const Home = () => {
  const openingHours = [
    { day: "Lunedì - Venerdì", hours: "9:00 - 18:00" },
    { day: "Sabato", hours: "10:00 - 14:00" },
    { day: "Domenica", hours: "Chiuso" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section with Opening Hours overlay */}
      <section className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden">
        <img
          src={heroBg}
          alt="Purissima landscape"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-secondary/60" />
        
        <div className="container relative mx-auto flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-8 px-4 py-12 text-center">
          <div>
            <h1 className="mb-4 font-serif text-4xl font-bold text-secondary-foreground md:text-6xl">
              Benvenuti su Purissima™
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-secondary-foreground/90 md:text-xl">
              La migliore destinazione per prodotti artigianali di alta qualità nel mondo Minecraft. 
              Ordina oggi e ricevi i tuoi oggetti direttamente nella tua base!
            </p>
          </div>

          <Card className="w-full max-w-xs border-none bg-background/20 shadow-lg backdrop-blur-md">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-secondary-foreground" />
                <h2 className="text-base font-bold text-secondary-foreground">Orari di Apertura</h2>
              </div>
              <div className="space-y-2">
                {openingHours.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b border-secondary-foreground/20 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-sm font-medium text-secondary-foreground">{item.day}</span>
                    <span className="text-sm text-secondary-foreground/70">{item.hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
