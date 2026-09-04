import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { treeNodeTypes } from './reactFlowTypes.jsx';

export default function TreeRenderer({ state }) {
  const { nodes, edges } = useMemo(() => {
    const treeNodes = state?.nodes ?? [];
    const byId = Object.fromEntries(treeNodes.map((node) => [node.id, node]));

    const flowNodes = treeNodes.map((node) => ({
      id: node.id,
      type: 'treeNode',
      position: { x: node.x ?? 0, y: node.y ?? 0 },
      data: {
        label: node.label ?? String(node.value),
        highlighted: node.highlighted,
        secondary: node.secondary,
      },
    }));

    const flowEdges = treeNodes
      .filter((node) => node.parentId && byId[node.parentId])
      .map((node) => {
        const active = node.highlighted || byId[node.parentId]?.highlighted;
        return {
          id: `${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: 'smoothstep',
          animated: active,
          style: {
            stroke: active ? '#4f46e5' : '#94a3b8',
            strokeWidth: active ? 3 : 2,
          },
        };
      });

    return { nodes: flowNodes, edges: flowEdges };
  }, [state]);

  if (!nodes.length) {
    return <div className="flex h-80 items-center justify-center text-slate-400">No tree data</div>;
  }

  return (
    <div className="h-[32rem] rounded-xl border dark:border-slate-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={treeNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
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
