'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from 'next-themes';

interface MagicCardProps {
    title?: string;
    value?: string | number;
    icon?: LucideIcon;
    trend?: string;
    trendValue?: string;
    data?: { value: number }[];
    className?: string;
    loading?: boolean;
    description?: string;
    children?: React.ReactNode;
    gradientColor?: string;
}

export function MagicCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    data,
    className,
    loading = false,
    description,
    children,
    gradientColor
}: MagicCardProps) {
    const { theme } = useTheme();
    const isPositive = trend === 'up';
    const isNegative = trend === 'down';
    const isNeutral = !trend || trend === 'neutral';

    // Generate sparkline path
    const getSparklinePath = () => {
        if (!data || data.length < 2) return '';

        const width = 120;
        const height = 40;
        const min = Math.min(...data.map(d => d.value));
        const max = Math.max(...data.map(d => d.value));
        const range = max - min || 1;

        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((d.value - min) / range) * height;
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    if (loading) {
        return (
            <div className={cn(
                "relative overflow-hidden rounded-xl border border-border/50 bg-background/50 p-6 backdrop-blur-xl",
                "animate-pulse",
                className
            )}>
                <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-8 w-8 bg-muted rounded-full" />
                </div>
                <div className="mt-4 h-8 w-32 bg-muted rounded" />
                <div className="mt-4 h-10 w-full bg-muted rounded" />
            </div>
        );
    }

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-xl border border-border/50 bg-background/50 p-6 backdrop-blur-xl transition-all duration-300",
            "hover:bg-accent/5 hover:border-accent/20 hover:shadow-lg hover:shadow-primary/5",
            "dark:bg-slate-900/40 dark:border-slate-800/60",
            className
        )}>
            {/* Background Gradient Effect */}
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />

            <div className="relative z-10">
                {(title || value || Icon) && (
                    <div className="flex items-center justify-between">
                        {title && <p className="text-sm font-medium text-muted-foreground">{title}</p>}
                        {Icon && (
                            <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300",
                                "group-hover:bg-primary group-hover:text-primary-foreground"
                            )}>
                                <Icon className="h-4 w-4" />
                            </div>
                        )}
                    </div>
                )}

                {(value || trendValue) && (
                    <div className="mt-2 flex items-baseline gap-2">
                        {value && <h3 className="text-2xl font-bold tracking-tight">{value}</h3>}
                        {trendValue && (
                            <span className={cn(
                                "flex items-center text-xs font-medium",
                                isPositive && "text-green-500",
                                isNegative && "text-red-500",
                                isNeutral && "text-muted-foreground"
                            )}>
                                {isPositive && <TrendingUp className="mr-1 h-3 w-3" />}
                                {isNegative && <TrendingDown className="mr-1 h-3 w-3" />}
                                {isNeutral && <Minus className="mr-1 h-3 w-3" />}
                                {trendValue}
                            </span>
                        )}
                    </div>
                )}

                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                )}

                {/* Sparkline Chart */}
                {data && data.length > 1 && (
                    <div className="mt-4 h-10 w-full overflow-hidden">
                        <svg
                            width="100%"
                            height="100%"
                            viewBox="0 0 120 40"
                            preserveAspectRatio="none"
                            className="overflow-visible"
                        >
                            <path
                                d={getSparklinePath()}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                                className={cn(
                                    "opacity-50 transition-all duration-300 group-hover:opacity-100",
                                    isPositive ? "text-green-500" : "text-primary"
                                )}
                            />
                            <path
                                d={`${getSparklinePath()} L 120,40 L 0,40 Z`}
                                fill="currentColor"
                                className={cn(
                                    "opacity-10 transition-all duration-300 group-hover:opacity-20",
                                    isPositive ? "text-green-500" : "text-primary"
                                )}
                            />
                        </svg>
                    </div>
                )}

                {children}
            </div>
        </div>
    );
}
