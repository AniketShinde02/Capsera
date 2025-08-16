import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle, Activity } from 'lucide-react';

export default function StatusPage() {
  const services = [
    {
      name: 'API Service',
      status: 'operational',
      uptime: '99.9%',
      responseTime: '120ms'
    },
    {
      name: 'Caption Generation',
      status: 'operational',
      uptime: '99.8%',
      responseTime: '2.1s'
    },
    {
      name: 'Image Upload',
      status: 'operational',
      uptime: '99.9%',
      responseTime: '450ms'
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: '99.9%',
      responseTime: '45ms'
    },
    {
      name: 'Email Service',
      status: 'operational',
      uptime: '99.7%',
      responseTime: '1.2s'
    }
  ];

  const incidents = [
    {
      date: 'Jan 8, 2025',
      title: 'Resolved: Temporary slowdown in caption generation',
      status: 'resolved',
      description: 'Some users experienced slower response times during peak hours. Issue was resolved by scaling our AI infrastructure.'
    },
    {
      date: 'Jan 5, 2025',
      title: 'Scheduled maintenance completed',
      status: 'completed',
      description: 'Database maintenance completed successfully with no service interruption.'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'down':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500 hover:bg-green-600">Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Degraded</Badge>;
      case 'down':
        return <Badge className="bg-red-500 hover:bg-red-600">Down</Badge>;
      case 'resolved':
        return <Badge variant="secondary">Resolved</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            System <span className="gradient-text">Status</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Real-time status and uptime information for all CaptionCraft services.
          </p>
          
          {/* Overall Status */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-lg font-semibold text-green-500">All Systems Operational</span>
          </div>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-8">Service Status</h2>
          
          <div className="space-y-4">
            {services.map((service, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Uptime: {service.uptime}</span>
                          <span>Response: {service.responseTime}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-8">Recent Incidents</h2>
          
          <div className="space-y-6">
            {incidents.map((incident, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{incident.title}</CardTitle>
                    </div>
                    {getStatusBadge(incident.status)}
                  </div>
                  <CardDescription>{incident.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{incident.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {incidents.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recent Incidents</h3>
                <p className="text-muted-foreground">
                  All systems have been running smoothly with no reported incidents.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Metrics */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold mb-8">Performance Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Overall Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">99.9%</div>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">1.2s</div>
                  <p className="text-sm text-muted-foreground">Caption generation</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500 mb-2">99.8%</div>
                  <p className="text-sm text-muted-foreground">API requests</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
