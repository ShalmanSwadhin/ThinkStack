import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { graphNodeTypes } from './reactFlowTypes.jsx';

export default function GraphRenderer({ state }) {
  const { nodes, edges } = useMemo(() => {
    const flowNodes = (state?.nodes ?? []).map((node) => ({
      id: node.id,
      type: 'graphNode',
      position: { x: node.x ?? 0, y: node.y ?? 0 },
      data: {
        label: node.label ?? node.id,
        highlighted: node.highlighted,
        visited: node.visited,
        distance: node.distance,
      },
    }));

    const flowEdges = (state?.edges ?? []).map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      label: edge.weight !== undefined ? String(edge.weight) : undefined,
      animated: edge.highlighted || edge.inMst,
      style: {
        stroke: edge.inMst ? '#10b981' : edge.highlighted ? '#4f46e5' : '#94a3b8',
        strokeWidth: edge.highlighted || edge.inMst ? 3 : 2,
      },
      labelStyle: { fill: '#64748b', fontWeight: 600 },
      labelBgStyle: { fill: 'rgba(255,255,255,0.85)' },
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [state]);

  if (!nodes.length) {
    return <div className="flex h-80 items-center justify-center text-slate-400">No graph data</div>;
  }

  return (
    <div className="h-[32rem] rounded-xl border dark:border-slate-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={graphNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.25}
        maxZoom={2}
        panOnScroll
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} />
        <MiniMap pannable zoomable nodeStrokeWidth={3} />
        <Controls showInteractive />
      </ReactFlow>
    </div>
  );
}
