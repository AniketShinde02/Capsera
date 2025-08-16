import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Rocket } from 'lucide-react';

export default function CareersPage() {
  // Redirect to feature development page
  redirect('/feature-development');

  // Original careers code (this won't execute due to redirect, but kept for future use)
  const openings = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build beautiful and intuitive user interfaces for our AI-powered platform.',
      requirements: ['React/Next.js', 'TypeScript', 'Tailwind CSS', '3+ years experience']
    },
    {
      title: 'AI/ML Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Develop and improve our caption generation algorithms and models.',
      requirements: ['Python', 'TensorFlow/PyTorch', 'NLP experience', '5+ years experience']
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Design delightful user experiences for creators and businesses.',
      requirements: ['Figma', 'User Research', 'Design Systems', '4+ years experience']
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Join Our <span className="gradient-text">Amazing Team</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Help us build the future of AI-powered content creation. We're looking for passionate people to join our mission.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-4 py-2">
              🌍 Remote-first company
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              💰 Competitive salary
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🏥 Full benefits
            </Badge>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {openings.map((job, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="text-base mb-4">{job.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <Users className="w-3 h-3 mr-1" />
                      {job.department}
                    </Badge>
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {job.location}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {job.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Requirements:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {job.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button asChild className="w-full">
                      <Link href="/contact">Apply Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Don't see a perfect fit? We're always looking for talented people!
            </p>
            <Button asChild variant="outline">
              <Link href="/contact">Send Us Your Resume</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Company Culture */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why CaptionCraft?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Rocket className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation First</h3>
              <p className="text-muted-foreground">
                Work on cutting-edge AI technology that's shaping the future of content creation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Amazing Team</h3>
              <p className="text-muted-foreground">
                Collaborate with talented, passionate people who care about making a difference.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
