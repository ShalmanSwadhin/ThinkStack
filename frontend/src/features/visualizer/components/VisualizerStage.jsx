import Card, { CardContent } from '../../../components/ui/Card';
import ArrayRenderer from './ArrayRenderer';
import GraphRenderer from './GraphRenderer';
import TreeRenderer from './TreeRenderer';
import MatrixRenderer from './MatrixRenderer';

const renderers = {
  array: ArrayRenderer,
  graph: GraphRenderer,
  tree: TreeRenderer,
  matrix: MatrixRenderer,
};

export default function VisualizerStage({ rendererType, step, className }) {
  const Renderer = renderers[rendererType] ?? ArrayRenderer;

  return (
    <Card className={className}>
      <CardContent>
        <p className="mb-4 min-h-[48px] text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {step?.description ?? 'Generate steps to start visualization.'}
        </p>
        <div className="overflow-hidden">
          <Renderer state={step?.state} />
        </div>
      </CardContent>
    </Card>
  );
}
