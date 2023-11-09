import { useRef, useEffect, useState, useCallback } from 'react';
import { Button, Stack } from '@chakra-ui/react'
import ReactFlow, {
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

const fs = require('fs')

const flowKey: string = 'example-flow';

const getNodeId = () => `randomnode_${+new Date()}`;

export default  ({setData, updateNode}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const refNode = useRef();
  const [rfInstance, setRfInstance] = useState();
  const { setViewport, getNodes } = useReactFlow();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      fs.writeFileSync(`f:/${flowKey}.json`, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(fs.readFileSync(`f:/${flowKey}.json`));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  const onAdd = useCallback(() => {
    const newNode = {
      id: getNodeId(),
      data: { label: 'Added node', chainnerData: '{"version":"0.20.2","content":{"nodes":[],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}},"timestamp":"2023-11-07T11:55:41.524Z","checksum":"f1372fb648293d72231fe9051f9cc3c0","migration":35}'},
      position: {
        x: Math.random() * window.innerWidth - 100,
        y: Math.random() * window.innerHeight,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const onDoubleClicked = useCallback((e, node) => {
    refNode.current = node;
    setData(node.data);
  }, [setData])

  useEffect(() => {
    if(!refNode.current)
      return;
    if(updateNode) {
      const v = getNodes().map((n) => {
        if(n.id != refNode.current.id)
          return n;
        return {...n, data:{...updateNode}};
      })
      setNodes(v);
    }
  }, [updateNode])


  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={setRfInstance}
      onNodeDoubleClick={onDoubleClicked}
    >
      <Controls />
      <Panel position="top-right">
        <Stack direction='row' spacing={4}>
          <Button onClick={onSave}>save</Button>
          <Button onClick={onRestore}>restore</Button>
          <Button onClick={onAdd}>add node</Button>
        </Stack>
      </Panel>
    </ReactFlow>
  );
};
