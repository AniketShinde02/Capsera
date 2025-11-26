'use client';

import { MagicCard } from '@/components/admin/dashboard/magic-card';
import { MessageSquare, Image as ImageIcon, Star, Activity, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats {
    captionsGenerated: number;
    totalImages: number;
    mostUsedMood: string;
    averageLength: number;
}

export function StatsBento({ stats, loading }: { stats: Stats; loading?: boolean }) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
            <motion.div variants={item} className="md:col-span-2 lg:col-span-1">
                <MagicCard
                    title="Total Captions"
                    value={stats.captionsGenerated}
                    icon={MessageSquare}
                    gradientColor="#6366f1"
                    loading={loading}
                    description="All time generations"
                />
            </motion.div>

            <motion.div variants={item}>
                <MagicCard
                    title="Images Processed"
                    value={stats.totalImages}
                    icon={ImageIcon}
                    gradientColor="#8b5cf6"
                    loading={loading}
                    description="Uploaded & analyzed"
                />
            </motion.div>

            <motion.div variants={item}>
                <MagicCard
                    title="Favorite Mood"
                    value={stats.mostUsedMood}
                    icon={Star}
                    gradientColor="#ec4899"
                    loading={loading}
                    description="Your signature style"
                />
            </motion.div>

            <motion.div variants={item} className="md:col-span-2 lg:col-span-1">
                <MagicCard
                    title="Avg. Length"
                    value={stats.averageLength}
                    icon={Activity}
                    gradientColor="#10b981"
                    loading={loading}
                    description="Characters per caption"
                />
            </motion.div>
        </motion.div>
    );
}
