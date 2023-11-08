import React, { useCallback, useEffect } from 'react';
import ReactFlow, { useReactFlow, Controls, useNodesState, useEdgesState, addEdge, Node, Edge } from 'reactflow';
import { FiFile } from 'react-icons/fi';

import 'reactflow/dist/base.css';
import './index.css';
import TurboNode, { TurboNodeData } from './TurboNode';
import TurboEdge from './TurboEdge';
import FunctionIcon from './FunctionIcon';

const initialNodes: Node<TurboNodeData>[] = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { icon: <FunctionIcon />, title: 'readFile', subline: 'api.ts', chainnerData: '{"version":"0.20.2","content":{"nodes":[],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}},"timestamp":"2023-11-07T11:55:41.524Z","checksum":"f1372fb648293d72231fe9051f9cc3c0","migration":35}',},
    type: 'turbo',
  },
  {
    id: '2',
    position: { x: 250, y: 0 },
    data: { icon: <FunctionIcon />, title: 'bundle', subline: 'apiContents' , chainnerData: '{"version":"0.20.2","content":{"nodes":[],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}},"timestamp":"2023-11-07T11:55:41.524Z","checksum":"f1372fb648293d72231fe9051f9cc3c0","migration":35}',},
    type: 'turbo',
  },
  {
    id: '3',
    position: { x: 0, y: 250 },
    data: { icon: <FunctionIcon />, title: 'readFile', subline: 'sdk.ts', chainnerData: '{"version":"0.20.2","content":{"nodes":[],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}},"timestamp":"2023-11-07T11:55:41.524Z","checksum":"f1372fb648293d72231fe9051f9cc3c0","migration":35}', },
    type: 'turbo',
  },
  {
    id: '4',
    position: { x: 250, y: 250 },
    data: { icon: <FunctionIcon />, title: 'bundle', subline: 'sdkContents', chainnerData: '{"version":"0.20.2","content":{"nodes":[],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}},"timestamp":"2023-11-07T11:55:41.524Z","checksum":"f1372fb648293d72231fe9051f9cc3c0","migration":35}', },
    type: 'turbo',
  },
  {
    id: '5',
    position: { x: 500, y: 125 },
    data: { icon: <FunctionIcon />, title: 'concat', subline: 'api, sdk', chainnerData: '{"version":"0.20.2","content":{"nodes":[],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}},"timestamp":"2023-11-07T11:55:41.524Z","checksum":"f1372fb648293d72231fe9051f9cc3c0","migration":35}', },
    type: 'turbo',
  },
  {
    id: '6',
    position: { x: 750, y: 125 },
    data: { icon: <FiFile />, title: 'fullBundle', chainnerData: '{"version":"0.20.2","content":{"nodes":[],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}},"timestamp":"2023-11-07T11:55:41.524Z","checksum":"f1372fb648293d72231fe9051f9cc3c0","migration":35}', },
    type: 'turbo',
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
  },
  {
    id: 'e2-5',
    source: '2',
    target: '5',
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
  },
];

const nodeTypes = {
  turbo: TurboNode,
};

const edgeTypes = {
  turbo: TurboEdge,
};

const defaultEdgeOptions = {
  type: 'turbo',
  markerEnd: 'edge-circle',
};

const Flow = ({setData, updateNode}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const {
    getNodes,
  } = useReactFlow();
  const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);
  const newNodes = nodes.map((n) => {
    return {...n, data:{...n.data, dataSetter:setData}}
  })
  useEffect(() => {
    if(updateNode) {
      const v = getNodes().map((n) => {
        if(n.data.title != updateNode.title)
          return n;
        return {...n, data:{...updateNode}};
      })
      console.log(v);
      setNodes(v);
    }
  }, [updateNode])

  return (
    <ReactFlow
      nodes={newNodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
    >
      <Controls showInteractive={false} />
      <svg>
        <defs>
          <linearGradient id="edge-gradient">
            <stop offset="0%" stopColor="#ae53ba" />
            <stop offset="100%" stopColor="#2a8af6" />
          </linearGradient>

          <marker
            id="edge-circle"
            viewBox="-5 -5 10 10"
            refX="0"
            refY="0"
            markerUnits="strokeWidth"
            markerWidth="10"
            markerHeight="10"
            orient="auto"
          >
            <circle stroke="#2a8af6" strokeOpacity="0.75" r="2" cx="0" cy="0" />
          </marker>
        </defs>
      </svg>
    </ReactFlow>
  );
};

export default Flow;
