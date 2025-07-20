import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Users, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              chatsPeCharcha
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              Connect, Chat, Collaborate
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience seamless communication with our modern chat platform. 
              Built for teams, communities, and everyone in between.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="hero" size="lg" className="min-w-[200px]">
                  Start Chatting Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  Already have an account?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose chatsPeCharcha?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for modern communication, all in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-soft transition-[var(--transition-smooth)] group">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-accent rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-[var(--transition-smooth)]">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Messaging</h3>
              <p className="text-muted-foreground">
                Instant messaging with lightning-fast delivery and read receipts.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-soft transition-[var(--transition-smooth)] group">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-accent rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-[var(--transition-smooth)]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Group Chats</h3>
              <p className="text-muted-foreground">
                Create groups for teams, friends, or communities with ease.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-soft transition-[var(--transition-smooth)] group">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-accent rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-[var(--transition-smooth)]">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                End-to-end encryption ensures your conversations stay private.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-soft transition-[var(--transition-smooth)] group">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-accent rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-[var(--transition-smooth)]">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Optimized for speed with instant loading and smooth performance.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Chatting?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users already using chatsPeCharcha for their daily communication needs.
          </p>
          <Link to="/signup">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-background text-primary hover:bg-background/90 shadow-glow min-w-[200px]"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">chatsPeCharcha</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 chatsPeCharcha. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;