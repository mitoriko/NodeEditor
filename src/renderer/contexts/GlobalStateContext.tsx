import { assign, createMachine, log } from 'xstate';
import { createActorContext } from '@xstate/react';
import { addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';

const machine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5SAtFQAjqDELQbeYDpB90YcE1Blo0EUjAYkDR-QRPjAgoME6HAbQAYBdRUABwHtYBLAFx6cAdmxAAPRAEYAHADZsjRYoAsygKzLZAJjUBOADQgAnlIDsp7OoDMkydbVXT0yVoC+rw2ix4iZQAvxgDIRdEysSCBcvALCohIIMvJKKuqaOgbGiFZaVti6jNqmmYySagWyyu6eGDgEJKQAcgDyACIAogDKAPoAwgASAIJ1AOItTSGiEfyCImGxOrKGJghW2WoVIF7VvqQjw529A8OjLOPck9EziHMLiAC0dtirHutV2HRUpIAx2oAIRm+UY2ETKLTUCxeIKJQlRjSUxaRQOa4IXTZRjKXRogpaUwyFG6NYbV60d5UQAOpoA7Y0Ay36AEPN-hxTkCYohNMilNJpFYirDpMoEcULFotLI1A4irJnCjyk98WSqe9vtLKVQaeE6VMGQgmeDFKz2S4odz0nE8tgYYLZMUZGpZKZRXiXnRAp8frRAkrAaqLnE5JrGJDobCfVYEZjsso8lpnKZGMt2bi1kJOBA4KINidIu6Qbd5ga7kUcmjdGzZLllNbdBLKt4asRU2dgeJGVoecVjdahdJdKKUT7bd5fjX6R7lrpvSVhVpdGpGwbbFpsNJGAWkcorKjlHZTD2cPKqP30-WEGUEooXGirVZJ1PFrY1NgY+2Vyuy3ZZJuCYFd+cM0srMPEqP2eOk5Bs4OTtmaVhmrokaaBK7hAA */
    id: '全局框架',
    initial: '设备拓扑',
    context: {
        currentNode: {},
        nodes: [{
            id: '0',
            type: 'default',
            data: { label: 'Node 1' },
            position: { x: 100, y: 100 },
        }],
        edges: [],
    },
    states: {
        设备拓扑: {
            on: {
                编辑节点: {
                    target: '节点编辑',
                    actions: assign({
                        currentNode: (data) => data.event.node,
                    }),
                },
                运行节点: '节点运行',
                NODES_CHANGED: {
                    actions: ['changeNodes', log('NODES_CHANGED')],
                },
                EDGES_CHANGED: {
                    actions: ['changeEdges', log('EDGES_CHANGED'), log(({context})=>context)],
                },
                CONNECT_NODES: {
                    actions: [log('Enter Connect_Nodes'), 'connectNodes', log('CONNECT_NODES')],
                }
            },
        },

        节点编辑: {
            on: {
                完成节点编辑: {
                    target: '设备拓扑',
                    actions: assign({
                        currentNode: (data) => data.event.node,
                    }),
                },
                编辑数据结构: '数据结构编辑',
            },
        },

        数据结构编辑: {
            on: {
                完成数据结构编辑: '节点编辑',
            },
        },

        节点运行: {
            on: {
                完成节点运行: '设备拓扑',
            },
        },
    },
}).provide({
    actions: {
        changeNodes: assign({
            nodes: ({context, event}) => applyNodeChanges(event.changes, context.nodes),
        }),
        changeEdges: assign({
            edges: ({context, event}) => applyEdgeChanges(event.changes, context.edges),
        }),
        connectNodes: assign({
            edges: ({context, event}) => addEdge(event.connection, context.edges),
        })
    }
});


export const GlobalStateContext = createActorContext(machine);

export const GlobalStateProvider = ({ children }: React.PropsWithChildren<unknown>) => {
    return <GlobalStateContext.Provider children={children} />
};
