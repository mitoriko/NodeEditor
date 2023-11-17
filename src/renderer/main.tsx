import { Box, Center, Text, VStack } from '@chakra-ui/react';
import { memo, useCallback, useRef } from 'react';
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
import { ConfigEditor } from './components/ConfigEditor';
import TopologyView from './components/TopologyView';
import { GlobalStateProvider } from './contexts/GlobalStateContext';

interface InitPageProps {
    title: string;
};

const InitPage = memo(({title}: InitPageProps) => {
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
                    <Text>{title}</Text>
                </VStack>
            </Center>
        </Box>
    )
})

export const Main = memo(() => {
    const { t, ready } = useTranslation();
    const { sendAlert } = useContext(AlertBoxContext);
    const { connectionState } = useContext(BackendContext);
    const reactFlowWraper = useRef<HTMLDivElement>(null);

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

    if (connectionState === 'failed')
        return <InitPage title={t('connectionFailed', 'Connection failed')} />;

    if (connectionState === 'connecting' || !ready)
        return <InitPage title={t('loading', 'Loading...')} />;

    return (
        <SettingsProvider>
            <GlobalStateProvider>
                <ReactFlowProvider>
                    <GlobalProvider reactFlowWrapper={reactFlowWraper}>
                        <ExecutionProvider>
                            <DependencyProvider>
                                <HistoryProvider>
                                    <ConfigEditor reactFlowWrapper={reactFlowWraper}/>
                                    <TopologyView />
                                </HistoryProvider>
                            </DependencyProvider>
                        </ExecutionProvider>
                    </GlobalProvider>
                </ReactFlowProvider>
            </GlobalStateProvider>
        </SettingsProvider>
    );
});
