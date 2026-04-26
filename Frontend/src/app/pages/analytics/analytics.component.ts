import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './analytics.component.html',
    styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
    @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;

    deals: any[] = [];
    loading = true;
    error = '';

    stages = ['New', 'In Progress', 'Negotiation', 'Won', 'Lost'];
    stageColors = ['#3b82f6', '#6366f1', '#f59e0b', '#10b981', '#ef4444'];

    stageCounts: number[] = [];
    stageAmounts: number[] = [];

    totalDeals = 0;
    wonDeals = 0;
    lostDeals = 0;
    totalRevenue = 0;
    winRate = 0;

    monthLabels: string[] = [];
    monthRevenue: number[] = [];

    private dataLoaded = false;
    private viewReady = false;

    constructor(private api: ApiService) {}

    ngOnInit(): void {
        this.api.getDeals().subscribe({
            next: (deals) => {
                this.deals = deals;
                this.calcMetrics();
                this.loading = false;
                this.dataLoaded = true;
                
                setTimeout(() => {
                    if (this.viewReady) this.drawCharts();
                }, 50);
            },
            error: (err) => {
                this.error = 'Не удалось загрузить данные';
                this.loading = false;
                console.error(err);
            }
        });
    }

    ngAfterViewInit(): void {
        this.viewReady = true;
        if (this.dataLoaded) this.drawCharts();
    }

    calcMetrics(): void {
        this.totalDeals = this.deals.length;
        this.wonDeals = this.deals.filter(d => d.stage === 'Won').length;
        this.lostDeals = this.deals.filter(d => d.stage === 'Lost').length;
        this.totalRevenue = this.deals
            .filter(d => d.stage === 'Won')
            .reduce((s, d) => s + parseFloat(d.value || 0), 0);
        this.winRate = this.totalDeals > 0
            ? Math.round((this.wonDeals / this.totalDeals) * 100) : 0;

        this.stageCounts = this.stages.map(s =>
            this.deals.filter(d => d.stage === s).length
        );
        this.stageAmounts = this.stages.map(s =>
            this.deals.filter(d => d.stage === s)
                .reduce((sum, d) => sum + parseFloat(d.value || 0), 0)
        );

        const map: Record<string, number> = {};
        this.deals
            .filter(d => d.stage === 'Won')
            .forEach(d => {
                const date = new Date(d.expected_close);
                if (isNaN(date.getTime())) return;
                const key = date.toLocaleString('en', { month: 'short', year: '2-digit' });
                map[key] = (map[key] || 0) + parseFloat(d.value || 0);
            });
        this.monthLabels = Object.keys(map);
        this.monthRevenue = Object.values(map);
    }

    drawCharts(): void {
        try { this.drawDonut(); } catch (e) { console.error('donut error', e); }
        try { this.drawBar(); } catch (e) { console.error('bar error', e); }
    }

    drawDonut(): void {
        const canvas = this.donutCanvas?.nativeElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;
        const outerR = Math.min(W, H) / 2 - 16;
        const innerR = outerR * 0.58;

        ctx.clearRect(0, 0, W, H);

        const total = this.stageCounts.reduce((a, b) => a + b, 0);

        if (total === 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
            ctx.fillStyle = '#e2e8f0';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.fillStyle = '#94a3b8';
            ctx.font = '13px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Нет данных', cx, cy);
            return;
        }

        let startAngle = -Math.PI / 2;
        this.stageCounts.forEach((count, i) => {
            if (count === 0) return;
            const slice = (count / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, outerR, startAngle, startAngle + slice);
            ctx.closePath();
            ctx.fillStyle = this.stageColors[i];
            ctx.fill();
            startAngle += slice;
        });

        ctx.beginPath();
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(total), cx, cy - 10);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.fillText('deals', cx, cy + 12);
    }

    drawBar(): void {
        const canvas = this.barCanvas?.nativeElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const W = canvas.width, H = canvas.height;
        const padL = 70, padR = 20, padT = 20, padB = 40;
        const chartW = W - padL - padR;
        const chartH = H - padT - padB;

        ctx.clearRect(0, 0, W, H);

        const data = this.monthRevenue.length > 0 ? this.monthRevenue : [0];
        const labels = this.monthLabels.length > 0 ? this.monthLabels : ['—'];
        const maxVal = Math.max(...data, 1);
        const gridLines = 4;

        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        for (let i = 0; i <= gridLines; i++) {
            const y = padT + chartH - (i / gridLines) * chartH;
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + chartW, y);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const val = Math.round((i / gridLines) * maxVal);
            ctx.fillText('$' + val.toLocaleString(), padL - 8, y);
        }

        const gap = chartW / data.length;
        const barW = Math.min(48, gap * 0.6);

        data.forEach((val, i) => {
            const barH = Math.max((val / maxVal) * chartH, val > 0 ? 4 : 0);
            const x = padL + i * gap + (gap - barW) / 2;
            const y = padT + chartH - barH;
            const r = 4;

            const grad = ctx.createLinearGradient(x, y, x, y + barH);
            grad.addColorStop(0, '#3b82f6');
            grad.addColorStop(1, '#6366f1');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + barW - r, y);
            ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
            ctx.lineTo(x + barW, y + barH);
            ctx.lineTo(x, y + barH);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#64748b';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(labels[i], x + barW / 2, padT + chartH + 8);
        });
    }

    getStagePercent(i: number): number {
        const total = this.stageCounts.reduce((a, b) => a + b, 0);
        return total > 0 ? Math.round((this.stageCounts[i] / total) * 100) : 0;
    }
}