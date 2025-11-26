'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityData {
    date: string;
    count: number;
}

export function ActivityChart({ data }: { data: ActivityData[] }) {
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Activity This Week
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between gap-2 h-32">
                    {data.map((day, index) => (
                        <motion.div
                            key={day.date}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: `${(day.count / maxCount) * 100}%`, opacity: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="flex-1 flex flex-col items-center gap-2"
                        >
                            <div className="w-full relative group">
                                <div
                                    className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all duration-300 group-hover:from-indigo-600 group-hover:to-purple-600"
                                    style={{ minHeight: day.count > 0 ? '8px' : '2px' }}
                                />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                        {day.count} caption{day.count !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
