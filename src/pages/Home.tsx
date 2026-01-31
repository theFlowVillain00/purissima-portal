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
      {/* Hero Section */}
      <section className="relative min-h-[70vh] w-full overflow-hidden">
        <img
          src={heroBg}
          alt="Purissima landscape"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-secondary/60" />
        
        <div className="container relative mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-secondary-foreground md:text-6xl">
            Benvenuti su Purissima™
          </h1>
          <p className="max-w-2xl text-lg text-secondary-foreground/90 md:text-xl">
            La migliore destinazione per prodotti artigianali di alta qualità nel mondo Minecraft. 
            Ordina oggi e ricevi i tuoi oggetti direttamente nella tua base!
          </p>
        </div>
      </section>

      {/* Opening Hours Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center">
          <Card className="w-full max-w-md border-border bg-card shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-card-foreground">Orari di Apertura</h2>
              </div>
              <div className="space-y-3">
                {openingHours.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                  >
                    <span className="font-medium text-card-foreground">{item.day}</span>
                    <span className="text-muted-foreground">{item.hours}</span>
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
