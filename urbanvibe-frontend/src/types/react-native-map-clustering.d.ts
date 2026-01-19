import React, { Component } from 'react';
import { MapViewProps } from 'react-native-maps';

declare module 'react-native-map-clustering' {
    interface MapClusteringProps extends MapViewProps {
        data?: any[];
        renderMarker?: (item: any) => any;
        renderCluster?: (cluster: any, onPress?: any) => any;
        clusterColor?: string;
        clusterTextColor?: string;
        clusterFontFamily?: string;
        clusterBackground?: string;
        radius?: number;
        minPoints?: number;
        animationEnabled?: boolean;
        clusteringEnabled?: boolean;
        preserveClusterPressBehavior?: boolean;
        layoutAnimationConf?: any;
        edgePadding?: { top: number; left: number; bottom: number; right: number };
        // Add other props as needed
    }

    export default class ClusteredMapView extends Component<MapClusteringProps> { }
}
