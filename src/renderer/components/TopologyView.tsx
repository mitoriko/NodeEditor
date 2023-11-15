import { useCallback, memo, useEffect } from 'react';
import { produce } from 'immer';
import { Button, HStack, Stack, VStack } from '@chakra-ui/react';
import ReactFlow, {
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    Panel,
    ReactFlowProvider,
    Connection,
    Edge,
    Node,
    SmoothStepEdge,
    ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';

const edgeTypes = {
    'smoothstep': SmoothStepEdge
};

interface Props {
    isHidden: boolean;
    onNodeDoubleClicked: (node: Node) => void;
    state;
}

export default memo(({ isHidden, onNodeDoubleClicked, state }: Props) => {
    // 以下定义的方法实现常规的ReactFlow事件处理：onNodesChange, onEdgesChange, onConnect
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    // 生成符合ReactFlow组件onNodeDoubleClick类型要求的事件处理方法，该方法将事件处理委托给外部的onNodeDoubleClicked方法实现。
    const onNodeDoubleClick = useCallback(
        (_event: any, node: any) => {
            onNodeDoubleClicked(node);
        },
        [onNodeDoubleClicked]
    );

    // 以下方法实现常规的onAdd事件处理方法。该方法在屏幕中心添加一个新的节点。方法中使用immer库实现了对nodes数组的不可变更新。
    const onAdd = useCallback(() => {
        setNodes((ns) =>
            produce(ns, (draft) => {
                draft.push({
                    id: draft.length.toString(),
                    type: 'default',
                    position: {
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                    },
                    data: { label: 'Added node', source: '' },
                });
            })
        );
    }, [setNodes]);

    useEffect(() => {
        // 如果newNode不为空，则使用immer库的produce方法实现对nodes数组相同id的Node的不可变更新。
        const newNode = state.context.currentNode;
        if(newNode) {
            setNodes((ns) =>
                produce(ns, (draft) => {
                    const node = draft.find((n) => n.id === newNode.id);
                    if(node) {
                        node.data = newNode.data;
                    }
                })
            );
        }
    }, [state]);


    return (
        <VStack
            bg="var(--window-bg)"
            h="100vh"
            overflow="hidden"
            p={2}
            w="100vw"
            hidden={isHidden}
        >
            <HStack
                h="calc(100vh - 80px)"
                w="full"
            >
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeDoubleClick={onNodeDoubleClick}
                        connectionLineType={ConnectionLineType.SmoothStep}
                        edgeTypes={edgeTypes}
                        defaultEdgeOptions={{type:'smoothstep'}}
                    >
                        <Controls />
                        <Panel position="top-right">
                            <Stack
                                direction="row"
                                spacing={4}
                            >
                                {/* <Button onClick={onSave}>save</Button> */}
                                {/* <Button onClick={onRestore}>restore</Button> */}
                                <Button onClick={onAdd}>add node</Button>
                            </Stack>
                        </Panel>
                    </ReactFlow>
                </ReactFlowProvider>
            </HStack>
        </VStack>
    );
});
