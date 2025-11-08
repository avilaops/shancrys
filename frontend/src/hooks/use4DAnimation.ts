import { useMemo } from 'react';
import type { Activity } from '../components/Timeline';

export interface ElementAnimationState {
    visible: boolean;
    opacity: number;
    isActive: boolean; // Currently being built
}

export function use4DAnimation(
    activities: Activity[],
    currentDate: Date,
    enabled: boolean
): Map<number, ElementAnimationState> {
    return useMemo(() => {
        const stateMap = new Map<number, ElementAnimationState>();

        if (!enabled) {
            // If 4D is disabled, show all elements
            activities.forEach((activity) => {
                activity.elementIds.forEach((elementId) => {
                    stateMap.set(elementId, {
                        visible: true,
                        opacity: 1,
                        isActive: false,
                    });
                });
            });
            return stateMap;
        }

        // Calculate state for each element based on current date
        activities.forEach((activity) => {
            const startTime = activity.startDate.getTime();
            const endTime = activity.endDate.getTime();
            const currentTime = currentDate.getTime();

            activity.elementIds.forEach((elementId) => {
                if (currentTime < startTime) {
                    // Not yet started - invisible
                    stateMap.set(elementId, {
                        visible: false,
                        opacity: 0,
                        isActive: false,
                    });
                } else if (currentTime >= startTime && currentTime <= endTime) {
                    // Currently being built - calculate progress
                    const progress = (currentTime - startTime) / (endTime - startTime);
                    const fadeInDuration = 0.1; // First 10% of activity duration

                    let opacity = 1;
                    const isActive = true;

                    if (progress < fadeInDuration) {
                        // Fade in during first 10%
                        opacity = progress / fadeInDuration;
                    }

                    stateMap.set(elementId, {
                        visible: true,
                        opacity,
                        isActive,
                    });
                } else {
                    // Completed - fully visible
                    stateMap.set(elementId, {
                        visible: true,
                        opacity: 1,
                        isActive: false,
                    });
                }
            });
        });

        return stateMap;
    }, [activities, currentDate, enabled]);
}
