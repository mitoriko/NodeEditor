import { HStack, VStack } from '@chakra-ui/react';
import { RefObject, memo } from 'react';
import { EdgeTypes, NodeTypes } from 'reactflow';
import { NodeType } from '../../common/common-types';
import { CustomEdge } from './CustomEdge/CustomEdge';
import { Header } from './Header/Header';
import { Node } from './node/Node';
import { NodeSelector } from './NodeSelectorPanel/NodeSelectorPanel';
import { ReactFlowBox } from './ReactFlowBox';
import { NodeDocumentationProvider } from '../contexts/NodeDocumentationContext';
import { GlobalStateContext } from '../contexts/GlobalStateContext';

const nodeTypes: NodeTypes & Record<NodeType, unknown> = {
    regularNode: Node,
    newIterator: Node,
    collector: Node,
};

const edgeTypes: EdgeTypes = {
    main: CustomEdge,
};

interface Props {
    reactFlowWrapper: RefObject<HTMLDivElement>;
}

export const ConfigEditor = memo(({ reactFlowWrapper }: Props) => {
    const isHidden = GlobalStateContext.useSelector((state) => !state.matches('节点编辑'));
    return (
        <VStack
            bg="var(--window-bg)"
            h="100vh"
            w="100vw"
            overflow="hidden"
            p={2}
            hidden={isHidden}
        >
            <NodeDocumentationProvider>
                <Header />
                <HStack
                    h="calc(100vh - 80px)"
                    w="full"
                >
                    <NodeSelector />
                    <ReactFlowBox
                        edgeTypes={edgeTypes}
                        nodeTypes={nodeTypes}
                        wrapperRef={reactFlowWrapper}
                    />
                </HStack>
            </NodeDocumentationProvider>
        </VStack>
    );
});
