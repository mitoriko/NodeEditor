import { Box, Center, HStack, IconButton, Tooltip } from '@chakra-ui/react';
import { memo } from 'react';
import { DependencyManagerButton } from '../DependencyManagerButton';
import { NodeDocumentationButton } from '../NodeDocumentation/NodeDocumentationModal';
import { SettingsButton } from '../SettingsModal';
import { SystemStats } from '../SystemStats';
import { AppInfo } from './AppInfo';
import { ExecutionButtons } from './ExecutionButtons';
import { KoFiButton } from './KoFiButton';
import { BsArrowLeft } from 'react-icons/bs';
import { GlobalContext } from '../../contexts/GlobalNodeState';
import { useContext } from 'use-context-selector';

export const Header = memo(() => {
    const { handleComplete } = useContext(GlobalContext);
    return (
        <Box
            alignItems="center"
            bg="var(--header-bg)"
            borderRadius="lg"
            borderWidth="0"
            display="flex"
            gap={4}
            h="56px"
            px={2}
            w="full"
        >
            <HStack>
                <AppInfo />
                <Tooltip
                    closeOnClick
                    closeOnPointerDown
                    borderRadius={8}
                    label="返回拓扑编辑"
                    px={2}
                    py={1}
                >
                    <IconButton
                        aria-label="返回拓扑编辑"
                        icon={<BsArrowLeft />}
                        size="md"
                        variant="outline"
                        onClick={handleComplete}
                        marginLeft={30}
                    >
                        返回拓扑编辑
                    </IconButton>
                </Tooltip>
            </HStack>
            <Center flexGrow="1">
                <ExecutionButtons />
            </Center>
            <HStack>
                <SystemStats />
                <NodeDocumentationButton />
                <DependencyManagerButton />
                <KoFiButton />
                <SettingsButton />
            </HStack>
        </Box>
    );
});
