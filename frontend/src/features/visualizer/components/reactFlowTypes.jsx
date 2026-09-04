import { memo } from 'react';
import { Handle, Position } from 'reactflow';

const TreeNodeComponent = ({ data }) => (
  <div
    className={`relative min-w-[52px] rounded-xl border-2 px-3 py-2 text-center text-sm font-semibold shadow-sm transition-all duration-300 ${
      data.highlighted
        ? 'scale-105 border-brand-500 bg-brand-500 text-white shadow-brand-500/30'
        : data.secondary
          ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
          : 'border-slate-300 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
    }`}
  >
    <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-slate-400" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-slate-400" />
  </div>
);

const GraphNodeComponent = ({ data }) => (
  <div
    className={`relative rounded-full border-2 px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-300 ${
      data.highlighted
        ? 'scale-110 border-brand-500 bg-brand-500 text-white shadow-brand-500/30'
        : data.visited
          ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
          : 'border-slate-300 bg-white text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
    }`}
  >
    <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-slate-400" />
    <div>{data.label}</div>
    {data.distance !== undefined && data.distance !== Infinity && (
      <div className="text-[10px] opacity-80">d={data.distance}</div>
    )}
    <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-slate-400" />
  </div>
);

/** Stable references — must not be recreated per render (React Flow #002). */
export const treeNodeTypes = Object.freeze({ treeNode: memo(TreeNodeComponent) });
export const graphNodeTypes = Object.freeze({ graphNode: memo(GraphNodeComponent) });
