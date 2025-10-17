import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Zap, Timer, Trophy, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-focus.jpg";

const Index = () => {
  const [isStarted, setIsStarted] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(240, 237, 252, 0.95), rgba(245, 243, 255, 0.98)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Brain className="w-4 h-4" />
              <span className="text-sm font-medium">Built for ADHD minds</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              FocusForge
            </h1>
            
            <p className="text-2xl md:text-3xl text-foreground/70 mb-8 font-light">
              Your chaos, organized with personality.
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              A productivity dashboard designed specifically for ADHD brains. 
              Turn focus time into points, tasks into wins, and chaos into clarity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 rounded-xl bg-gradient-to-r from-primary to-primary-glow hover:shadow-focus transition-all duration-300"
                onClick={() => setIsStarted(true)}
              >
                Start Focusing
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 rounded-xl border-2"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/20 blur-xl animate-pulse-glow" />
          <div className="absolute bottom-40 right-20 w-32 h-32 rounded-full bg-accent/20 blur-xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built Different, for Different Minds
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every feature designed with ADHD-friendly UX principles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Timer className="w-8 h-8" />}
              title="Pomodoro Timer"
              description="Visual progress rings that make time tangible. See your focus in real-time."
              gradient="from-primary to-primary-glow"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Drag & Drop Tasks"
              description="Reorganize by touch. Your brain likes moving things around—so do we."
              gradient="from-accent to-yellow-400"
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8" />}
              title="Points & Rewards"
              description="Every focus session earns points. Unlock motivational quotes and celebrate wins."
              gradient="from-green-500 to-emerald-400"
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="Smart Tracking"
              description="Automatic session logging. Your progress saves itself—no manual work."
              gradient="from-blue-500 to-cyan-400"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container px-6">
          <Card className="max-w-4xl mx-auto p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-2">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to forge your focus?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join ADHD-ers who are turning their chaos into productivity wins. 
              Free to start, powerful by design.
            </p>
            <Button 
              size="lg"
              className="text-lg px-8 py-6 rounded-xl bg-gradient-to-r from-primary to-primary-glow hover:shadow-focus transition-all duration-300"
            >
              Create Free Account
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard = ({ icon, title, description, gradient }: FeatureCardProps) => (
  <Card className="p-6 hover:shadow-card transition-all duration-300 group">
    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </Card>
);

export default Index;
