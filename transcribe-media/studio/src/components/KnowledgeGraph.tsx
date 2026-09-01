import React, { useEffect, useRef, useState } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, Play, Search, Filter } from 'lucide-react';
import * as d3Force from 'd3-force';
import * as d3Zoom from 'd3-zoom';
import * as d3Selection from 'd3-selection';
import { Catalog, Entity, Conversation, Relation } from '../types';

interface KnowledgeGraphProps {
  catalog: Catalog;
  onOpenConversation: (convId: string) => void;
}

interface GraphNode extends d3Force.SimulationNodeDatum {
  id: string;
  type: 'person' | 'project' | 'conversation' | 'entity';
  label: string;
  data: any;
}

interface GraphLink extends d3Force.SimulationLinkDatum<GraphNode> {
  id: string;
  type: string;
  confidence?: number;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  catalog,
  onOpenConversation,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });

  // Build graph model
  const rawNodes: GraphNode[] = [
    ...(catalog.entities || []).map((e) => ({
      id: e.id,
      type: (e.type === 'person' || e.type === 'project' ? e.type : 'entity') as any,
      label: e.name,
      data: e,
    })),
    ...(catalog.conversations || []).map((c) => ({
      id: c.id,
      type: 'conversation' as const,
      label: c.title,
      data: c,
    })),
  ];

  const nodeMap = new Map(rawNodes.map((n) => [n.id, n]));

  const rawLinks: GraphLink[] = [];
  for (const rel of catalog.relations || []) {
    if (nodeMap.has(rel.sourceId) && nodeMap.has(rel.targetId)) {
      rawLinks.push({
        id: rel.id,
        source: rel.sourceId,
        target: rel.targetId,
        type: rel.type,
        confidence: rel.confidence,
      });
    }
  }

  for (const conv of catalog.conversations || []) {
    for (const pid of conv.personIds || []) {
      if (nodeMap.has(pid)) {
        rawLinks.push({
          id: `mem:${conv.id}:${pid}`,
          source: conv.id,
          target: pid,
          type: 'participant',
        });
      }
    }
    for (const pjid of conv.projectIds || []) {
      if (nodeMap.has(pjid)) {
        rawLinks.push({
          id: `mem:${conv.id}:${pjid}`,
          source: conv.id,
          target: pjid,
          type: 'project',
        });
      }
    }
  }

  // Filter nodes & links
  const filteredNodes = rawNodes.filter((n) => {
    if (typeFilter && n.type !== typeFilter) return false;
    if (search && !n.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredLinks = rawLinks.filter(
    (l) =>
      activeNodeIds.has(typeof l.source === 'object' ? (l.source as any).id : (l.source as string)) &&
      activeNodeIds.has(typeof l.target === 'object' ? (l.target as any).id : (l.target as string))
  );

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);

  useEffect(() => {
    const width = 900;
    const height = 650;

    const simulation = d3Force
      .forceSimulation<GraphNode>(filteredNodes)
      .force(
        'link',
        d3Force
          .forceLink<GraphNode, GraphLink>(filteredLinks)
          .id((d) => d.id)
          .distance(70)
      )
      .force('charge', d3Force.forceManyBody().strength(-140))
      .force('center', d3Force.forceCenter(width / 2, height / 2))
      .force('collision', d3Force.forceCollide().radius(25));

    simulation.on('tick', () => {
      setNodes([...filteredNodes]);
      setLinks([...filteredLinks]);
    });

    return () => {
      simulation.stop();
    };
  }, [typeFilter, search, catalog]);

  // Zoom setup
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3Selection.select(svgRef.current);
    const zoomBehavior = d3Zoom
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        setTransform(event.transform);
      });

    svg.call(zoomBehavior as any);
  }, []);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'person':
        return '#f59e0b';
      case 'project':
        return '#10b981';
      case 'conversation':
        return '#8b5cf6';
      default:
        return '#06b6d4';
    }
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden h-[calc(100vh-140px)]">
      {/* Main Graph SVG Viewport (8 Cols) */}
      <div className="lg:col-span-8 bg-panel border border-borderSubtle rounded-2xl relative overflow-hidden flex flex-col">
        {/* Controls Toolbar */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-card/90 backdrop-blur-md p-2 rounded-xl border border-borderSubtle">
          <input
            type="text"
            placeholder="Find in graph..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-canvas border border-borderSubtle rounded-lg px-2.5 py-1 text-xs text-gray-100 placeholder-gray-500 outline-none w-36"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-canvas border border-borderSubtle rounded-lg px-2 py-1 text-xs text-gray-300 outline-none cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="person">People</option>
            <option value="project">Projects</option>
            <option value="conversation">Conversations</option>
          </select>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-borderSubtle text-[11px] text-gray-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" /> People
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Projects
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Conversations
          </span>
        </div>

        {/* SVG Simulation Frame */}
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          viewBox="0 0 900 650"
        >
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
            {/* Edges */}
            {links.map((link) => {
              const src = link.source as GraphNode;
              const tgt = link.target as GraphNode;
              if (src.x === undefined || src.y === undefined || tgt.x === undefined || tgt.y === undefined)
                return null;

              return (
                <line
                  key={link.id}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="#2a3045"
                  strokeWidth={1.5}
                  className="hover:stroke-accent transition"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              if (node.x === undefined || node.y === undefined) return null;
              const isSelected = selectedNode?.id === node.id;
              const r = node.type === 'person' ? 14 : node.type === 'project' ? 12 : 9;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={r}
                    fill={getNodeColor(node.type)}
                    stroke={isSelected ? '#fff' : '#141722'}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition group-hover:scale-125"
                  />
                  <text
                    y={r + 12}
                    textAnchor="middle"
                    fill="#f3f4f6"
                    fontSize={10}
                    className="font-medium pointer-events-none drop-shadow"
                  >
                    {node.label.slice(0, 16)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Node & Connection Inspector (4 Cols) */}
      <div className="lg:col-span-4 bg-panel border border-borderSubtle rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto">
        {selectedNode ? (
          <div className="flex flex-col gap-4">
            <div className="border-b border-borderSubtle pb-3">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${getNodeColor(selectedNode.type)}20`,
                  color: getNodeColor(selectedNode.type),
                  border: `1px solid ${getNodeColor(selectedNode.type)}40`,
                }}
              >
                {selectedNode.type}
              </span>
              <h3 className="text-lg font-bold text-gray-100 mt-2">{selectedNode.label}</h3>
            </div>

            {selectedNode.type === 'conversation' ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-gray-400">
                  Date: {selectedNode.data?.date || 'Undated session'}
                </p>
                <button
                  onClick={() => onOpenConversation(selectedNode.id)}
                  className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-black font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Open Audio &amp; Transcript</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Connected Conversations
                </h4>
                <div className="space-y-2">
                  {(catalog.conversations || [])
                    .filter((c) =>
                      [...(c.personIds || []), ...(c.projectIds || [])].includes(selectedNode.id)
                    )
                    .map((conv) => (
                      <div
                        key={conv.id}
                        className="p-3 bg-card rounded-xl border border-borderSubtle flex flex-col gap-1.5"
                      >
                        <span className="text-xs font-semibold text-gray-200">{conv.title}</span>
                        <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                          <span>{conv.date || 'Undated'}</span>
                          <button
                            onClick={() => onOpenConversation(conv.id)}
                            className="text-accent hover:underline font-bold"
                          >
                            Listen →
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 text-gray-500 gap-2 my-auto">
            <Network className="w-8 h-8 text-gray-600" />
            <h4 className="text-xs font-semibold text-gray-400">Inspect the Graph</h4>
            <p className="text-[11px] max-w-xs">
              Click any node to view verified relationships, participants, and attached audio sessions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
