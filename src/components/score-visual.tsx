"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { AnalysisResult } from "@/lib/analysis/schema";

const chartColors = ["#6e69ed", "#9d8bf4", "#25a890", "#efad69", "#5a9bd7", "#d27fa1"];

export function ScoreVisual({
  score,
  size = "large",
}: {
  score: number;
  size?: "large" | "small";
}) {
  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score },
  ];
  return (
    <div aria-label={`Resume feedback score: ${score} out of 100`} className={`score-visual score-${size}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="80%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill="#746af1" />
            <Cell fill="#eeedf7" />
          </Pie>
          <Tooltip content={() => null} />
        </PieChart>
      </ResponsiveContainer>
      <div className="score-center">
        <strong>{score}</strong>
        <span>out of 100</span>
      </div>
    </div>
  );
}

export function CategoryChart({ report }: { report: AnalysisResult }) {
  return (
    <div className="category-chart" role="img" aria-label="Category scores">
      {report.categories.map((category, index) => (
        <div className="category-row" key={category.category}>
          <div className="category-row-label">
            <span>{category.category === "impact" ? "Impact & achievements" : category.category[0].toUpperCase() + category.category.slice(1)}</span>
            <strong>{category.score}</strong>
          </div>
          <div
            aria-label={`${category.score} out of 100`}
            className="category-track"
            role="meter"
            aria-valuenow={category.score}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${category.score}%`, background: chartColors[index] }} />
          </div>
          <p>{category.explanation}</p>
        </div>
      ))}
    </div>
  );
}
