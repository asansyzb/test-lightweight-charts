'use client';

import { useRef, useEffect } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { SingleValueData, LineWidth } from 'lightweight-charts';

interface ChartProps {
	data: SingleValueData[];
	minPrice: number;
	maxPrice: number;
	averagePrice: number;
}

export function Chart({ data, minPrice, maxPrice, averagePrice }: ChartProps) {
	const ref = useRef<HTMLDivElement>(null);

	const backgroundColor = '#222';
	const lineColor = '#2962FF';
	const textColor = '#DDD';
	const areaTopColor = '#2962FF';
	const areaBottomColor = 'rgba(41, 98, 255, 0.28)';

	useEffect(() => {
		if (!ref || !ref.current) {
			return;
		}

		const handleResize = () => {
			if (!ref || !ref.current) {
				return;
			}
			chart.applyOptions({ width: ref.current.clientWidth });
		};

		const chart = createChart(ref.current, {
			layout: {
				background: { type: ColorType.Solid, color: backgroundColor },
				textColor,
			},
			grid: {
				vertLines: { color: '#444' },
				horzLines: { color: '#444' },
			},
			width: ref.current.clientWidth,
			height: ref.current.clientHeight,
		});
		chart.timeScale().fitContent();

		const minPriceLine = {
			price: minPrice,
			color: '#ef5350',
			lineWidth: 2 as LineWidth,
			lineStyle: 2, // LineStyle.Dashed
			axisLabelVisible: true,
			title: 'min price',
		};
		const avgPriceLine = {
			price: averagePrice,
			color: 'gray',
			lineWidth: 2 as LineWidth,
			lineStyle: 1, // LineStyle.Dotted
			axisLabelVisible: true,
			title: 'average price',
		};
		const maxPriceLine = {
			price: maxPrice,
			color: '#26a69a',
			lineWidth: 2 as LineWidth,
			lineStyle: 2, // LineStyle.Dashed
			axisLabelVisible: true,
			title: 'max price',
		};

		const series = chart.addAreaSeries({
			lineColor,
			topColor: areaTopColor,
			bottomColor: areaBottomColor,
		});
		series.setData(data);
		series.createPriceLine(minPriceLine);
		series.createPriceLine(avgPriceLine);
		series.createPriceLine(maxPriceLine);

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);

			chart.remove();
		};
	}, [
		data,
		backgroundColor,
		lineColor,
		textColor,
		areaTopColor,
		areaBottomColor,
	]);

	return (
		<div className="w-full min-h-96 relative" ref={ref}>
			<p className="absolute left-3 top-2 z-10">
				Average Price: ${averagePrice.toFixed(2)}
			</p>
			<p className="absolute left-3 top-8 z-10">
				Maximum Price: ${maxPrice.toFixed(2)}
			</p>
			<p className="absolute left-3 top-14 z-10">
				Minimum Price: ${minPrice.toFixed(2)}
			</p>
			<p className="absolute -rotate-90 -right-4 translate-x-4 top-1/2 -translate-y-1/2 z-10">Price</p>
			<p className="absolute -bottom-4 translate-y-4 left-1/2 -translate-x-1/2 z-10">Date</p>
		</div>
	);
}
