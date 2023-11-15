import { Box, Center, Text, VStack } from '@chakra-ui/react';
import { useState, memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactFlowProvider } from 'reactflow';
import { useContext } from 'use-context-selector';
import { getLocalStorage, getStorageKeys } from '../common/util';
import { ChaiNNerLogo } from './components/chaiNNerLogo';
import { HistoryProvider } from './components/HistoryProvider';
import { AlertBoxContext, AlertType } from './contexts/AlertBoxContext';
import { BackendContext } from './contexts/BackendContext';
import { DependencyProvider } from './contexts/DependencyContext';
import { ExecutionProvider } from './contexts/ExecutionContext';
import { GlobalProvider } from './contexts/GlobalNodeState';
import { SettingsProvider } from './contexts/SettingsContext';
import { useIpcRendererListener } from './hooks/useIpcRendererListener';
import { useLastWindowSize } from './hooks/useLastWindowSize';
import { assign, createMachine } from 'xstate';
import { useMachine } from '@xstate/react';
import { ConfigEditor } from './components/ConfigEditor';
import TopologyView from './components/TopologyView';

const machine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5SAtFQAjqDELQbeYDpB90YcE1Blo0EUjAYkDR-QRPjAgoME6HAbQAYBdRUABwHtYBLAFx6cAdmxAAPRAEYAHADZsjRYoAsygKzLZAJjUBOADQgAnlIDsp7OoDMkydbVXT0yVoC+rw2ix4iZQAvxgDIRdEysSCBcvALCohIIMvJKKuqaOgbGiFZaVti6jNqmmYySagWyyu6eGDh0VKSAMdqACEY1lCGiEfyCImGx8QqJqhraeoYmCM7YahUgXtW0tVSADqaAdsaAy36AIeatYe1RXaCxmtmJ0tJWRVqM0sojUiXYWlqyag5Fss6MqlMz2MvrtY0-ayomw43A60W6iAOfUUx1OLguV3ScTy2FMDzUsmKMgxplenyq2DogXqTVogWB4VBOxiUjk0MYJQuaMUDmuCC0BUseS0zlMjCsAsYuncHhAQk4EDgohmbSpnRpCAAtLI2cr8d4CCRZZF5RCEMotGzbGpUbintJdK93gz1bMqNqwbtxBkrLp6SVnlpdGpDUjbFpsNIhRarMpQ7plHZTLbvqtAZQHdS9WUEooXLpLQUfb7RsbsKddCGw8oI3ZZDGiQFE7q9i63YkPacvT62TzJDkLZirJjdHzNOURUA */
    id: '全局框架',
    initial: '设备拓扑',
    context: { currentNode: {} },
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

export const Main = memo(() => {
    const [newNode, setNewNode] = useState();
    const { t, ready } = useTranslation();
    const { sendAlert } = useContext(AlertBoxContext);
    const { connectionState } = useContext(BackendContext);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    const [current, send, actorRef] = useMachine(machine);

    useLastWindowSize();

    useIpcRendererListener(
        'show-collected-information',
        useCallback(
            (_, info) => {
                const localStorage = getLocalStorage();
                const fullInfo = {
                    ...info,
                    settings: Object.fromEntries(
                        getStorageKeys(localStorage).map((k) => [k, localStorage.getItem(k)])
                    ),
                };

                sendAlert({
                    type: AlertType.INFO,
                    title: t('alert.title.systemInformation', 'System information'),
                    message: JSON.stringify(fullInfo, undefined, 2),
                });
            },
            [sendAlert, t]
        )
    );

    if (connectionState === 'failed') return null;

    if (connectionState === 'connecting' || !ready) {
        return (
            <Box
                h="100vh"
                w="100vw"
            >
                <Center
                    h="full"
                    w="full"
                >
                    <VStack>
                        <ChaiNNerLogo
                            percent={0}
                            size={256}
                        />
                        <Text>{t('loading', 'Loading...')}</Text>
                    </VStack>
                </Center>
            </Box>
        );
    }

    return (
        <SettingsProvider>
            <ReactFlowProvider>
                <GlobalProvider
                    reactFlowWrapper={reactFlowWrapper}
                    state={current}
                    send={send}
                    onComplete={(node) => {
                        send({ type: '完成节点编辑', node });
                    }}
                >
                    <ExecutionProvider>
                        <DependencyProvider>
                            <HistoryProvider>
                                <ConfigEditor
                                    isHidden={!current.matches('节点编辑')}
                                    reactFlowWrapper={reactFlowWrapper}
                                />
                                <TopologyView
                                    state={current}
                                    isHidden={!current.matches('设备拓扑')}
                                    onNodeDoubleClicked={(node) => {
                                        send({ type: '编辑节点', node });
                                    }}
                                />
                            </HistoryProvider>
                        </DependencyProvider>
                    </ExecutionProvider>
                </GlobalProvider>
            </ReactFlowProvider>
        </SettingsProvider>
    );
});
