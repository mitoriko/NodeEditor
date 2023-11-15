import { assign, createMachine } from 'xstate';
import { createActorContext } from '@xstate/react';

const machine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5SAtFQAjqDELQbeYDpB90YcE1Blo0EUjAYkDR-QRPjAgoME6HAbQAYBdRUABwHtYBLAFx6cAdmxAAPRAEYAHADZsjRYoAsygKzLZAJjUBOADQgAnlIDsp7OoDMkydbVXT0yVoC+rw2ix4iZQAvxgDIRdEysSCBcvALCohIIMvJKKuqaOgbGiFZaVti6jNqmmYySagWyyu6eGDh0VKSAMdqACEY1lCGiEfyCImGx8QqJqhraeoYmCM7YahUgXtW0tVSADqaAdsaAy36AIeatYe1RXaCxmtmJ0tJWRVqM0sojUiXYWlqyag5Fss6MqlMz2MvrtY0-ayomw43A60W6iAOfUUx1OLguV3ScTy2FMDzUsmKMgxplenyq2DogXqTVogWB4VBOxiUjk0MYJQuaMUDmuCC0BUseS0zlMjCsAsYuncHhAQk4EDgohmbSpnRpCAAtLI2cr8d4CCRZZF5RCEMotGzbGpUbintJdK93gz1bMqNqwbtxBkrLp6SVnlpdGpDUjbFpsNIhRarMpQ7plHZTLbvqtAZQHdS9WUEooXLpLQUfb7RsbsKddCGw8oI3ZZDGiQFE7q9i63YkPacvT62TzJDkLZirJjdHzNOURUA */
    id: '全局框架',
    initial: '设备拓扑',
    context: {
        currentNode: {},
        topology: {
            nodes: [],
            edges: [],
            viewport,
        }
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
});


export const GlobalStateContext = createActorContext(machine);

export const GlobalStateProvider = ({ children }: React.PropsWithChildren<unknown>) => {
    return <GlobalStateContext.Provider children={children} />
};
