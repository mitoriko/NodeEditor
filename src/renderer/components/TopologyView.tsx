import { useCallback, memo, useEffect } from 'react';
import { produce } from 'immer';
import { Button, HStack, Stack, VStack } from '@chakra-ui/react';
import ReactFlow, {
    Controls,
    Panel,
    ReactFlowProvider,
    Node,
    SmoothStepEdge,
    ConnectionLineType,
    NodeChange,
    EdgeChange,
    useReactFlow,
    Connection,
    useNodesState,
} from 'reactflow';
import { GlobalStateContext } from '../contexts/GlobalStateContext';
import { Header } from './Header/Header';
import { assign, createMachine, log, raise, sendTo } from 'xstate';
import { createActorContext, useMachine } from '@xstate/react';
import useTopologyStore from '../hooks/useTopologyStore';

import 'reactflow/dist/style.css';

const machine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QBUD2AHVAbVUCeAagJZgDuAdAEpgCGEeAxAMoAuNATiwHKoRgAi7GlADC7WiyKoAdgG0ADAF1EoTLCKSZKkAA9EARgCch8oYDsZgCwA2M-vn2ArNcsAmADQg8B1yesAOeUd9V3lLMOtHQwBfaM80TBx8YjJyHj5BYTEJKWkGEVQAW3QsMBYwdIEhKAVlJBA1DVztPQRXfUtyeW7DMMtDF30AZn9PbwQh+VdyV19reSHHIZDDf39Y+IxsXEISCkrM0XEaTTyRGmkAY1LK7JPc2u1G05bEef1yR1nrH-9+s3kZkcYx8fkCwVC4Rsjn8MTiIAS22SezSvDAd1ODAAYkRpERYAALW7HU6PerPZr1VrzRzkEJuOzmIY-IYgiZTGZzBZLFZrWLw6Ro+D1RFJXZkJ6odQvKkGYKmCw2OwOIIuDxeRAAWhCnLcrkcZn8IT+-kiGwRWzFKQo1Do41UUqaWllCEsQzMXUMjimNnmPxhljZQJmQLMhmZjhh8ms+jM5tFO2tqIy1QxlId0vTukQ4Q+sPMgOshlc1hL1lZGrark65kipZcBtmjks8ctiZRxJyzozTukr1dRk5hqGQwGI30zcDlZGnWZvT+QInhbj-KAA */
    id: 'TopologyView',
    initial: 'Ready',
    context: ({ input }) => ({
        globalMachine: input.globalMachineRef,
        connectingNodeId: '',
    }),
    states: {
        Ready: {
            entry: log('Ready'),
            on: {
                StartNodeDragCreation: {
                    target: 'NodeDragCreation',
                    actions: [
                        assign({
                            connectingNodeId: ({ event }) => event.connectingNodeId,
                        }),
                    ],
                },
            },
        },

        NodeDragCreation: {
            entry: [log('NodeDragCreation')],
            on: {
                CompleteNodeDrag: {
                    target: 'NodeCreation',
                    actions: [log((a) => a)]
                },
                CancleNodeCreation: {
                    target: 'Ready',
                    actions: [
                        assign({
                            connectingNodeId: '',
                        }),
                    ],
                },
            },
        },
        NodeCreation: {
            entry: [log('NodeCreation'),
                    (para) => {
                        console.log(para);
                        const { connectingNodeId } = para.context;
                        const { position } = para.event;
                        const newNode = {
                            id: `${Math.random()}`,
                            type: 'default',
                            data: { label: 'Node 1' },
                            position: position,
                        };
                        para.event.onNodesChange([{ type: 'add', item: newNode }]);
                        para.event.onEdgesChange([{ type: 'add', source: connectingNodeId, target: newNode.id }]);
                    },],
            on: {
                FinishNodeCreation: {
                    target: 'Ready',
                    actions: log('FinishNodeCreation'),
                },
            },
            after: {
                100: {
                    target: 'Ready',
                    actions: [log('NodeCreation always'),],
                },
            },
        },
    },
});

const edgeTypes = {
    smoothstep: SmoothStepEdge,
};

export default memo(({}) => {
    const send = GlobalStateContext.useActorRef().send;
    const isHidden = GlobalStateContext.useSelector((state) => !state.matches('设备拓扑'));
    const { project } = useReactFlow();
    const nodes = useTopologyStore((state) => state.nodes);
    const edges = useTopologyStore((state) => state.edges);
    const onNodesChange = useTopologyStore((state) => state.onNodesChange);
    const onEdgesChange = useTopologyStore((state) => state.onEdgesChange);
    const onConnect = useTopologyStore((state) => state.onConnect);

    const [current, localSend] = useMachine(machine, {
        input: {
            globalMachineRef: GlobalStateContext.useActorRef(),
        },
    });

    const onConnectStart = useCallback(
        (_, { nodeId }) => {
            localSend({ type: 'StartNodeDragCreation', connectingNodeId: nodeId });
        },
        [localSend]
    );

    const onConnectEnd = useCallback(
        (event) => {
            if (!event.target.classList.contains('react-flow__pane')) {
                localSend({ type: 'CancleNodeCreation' });
            } else {
                const position = project({
                    x: event.clientX,
                    y: event.clientY,
                });
                localSend({ type: 'CompleteNodeDrag', position: position, onNodesChange: onNodesChange, onEdgesChange: onEdgesChange });
            }
        },
        [localSend, project]
    );

    return (
        <VStack
            bg="var(--window-bg)"
            h="100vh"
            overflow="hidden"
            p={2}
            w="100vw"
            hidden={isHidden}
        >
            <Header />
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
                        // onNodeDoubleClick={onNodeDoubleClick}
                        onConnectStart={onConnectStart}
                        onConnectEnd={onConnectEnd}
                        onConnect={onConnect}
                        connectionLineType={ConnectionLineType.SmoothStep}
                        edgeTypes={edgeTypes}
                        defaultEdgeOptions={{ type: 'smoothstep' }}
                    >
                        <Controls />
                        <Panel position="top-right">
                            <Stack
                                direction="row"
                                spacing={4}
                            >
                                {/* <Button onClick={onSave}>save</Button> */}
                                {/* <Button onClick={onRestore}>restore</Button> */}
                                {/* <Button onClick={onAdd}>add node</Button> */}
                            </Stack>
                        </Panel>
                    </ReactFlow>
                </ReactFlowProvider>
            </HStack>
        </VStack>
    );
});
