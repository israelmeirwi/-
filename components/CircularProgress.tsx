import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  color?: string;
  label?: string;
  subLabel?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 120,
  color = '#10B981', // Emerald-500
  label,
  subLabel
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const percentage = Math.min(1, Math.max(0, value / max));
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - percentage * circumference;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous

    const g = svg
      .append('g')
      .attr('transform', `translate(${size / 2},${size / 2})`);

    // Background Circle
    g.append('circle')
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', '#E5E7EB') // Gray-200
      .attr('stroke-width', strokeWidth)
      .attr('stroke-linecap', 'round');

    // Progress Circle
    g.append('circle')
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', percentage > 1 ? '#EF4444' : color) // Red if over limit
      .attr('stroke-width', strokeWidth)
      .attr('stroke-dasharray', circumference)
      .attr('stroke-dashoffset', offset)
      .attr('stroke-linecap', 'round')
      .attr('transform', 'rotate(-90)') // Start from top
      .style('transition', 'stroke-dashoffset 0.5s ease-in-out');

    // Text
    if (label) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', subLabel ? '-0.2em' : '0.3em')
        .attr('font-size', '24px')
        .attr('font-weight', 'bold')
        .attr('fill', '#374151')
        .text(label);
    }
    
    if (subLabel) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .attr('font-size', '12px')
        .attr('fill', '#6B7280')
        .text(subLabel);
    }

  }, [value, max, size, color, label, subLabel]);

  return <svg ref={svgRef} width={size} height={size} className="mx-auto" />;
};
