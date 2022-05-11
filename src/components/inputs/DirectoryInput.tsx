import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { memo } from 'react';
import { BsFolderPlus } from 'react-icons/bs';
import { useContextSelector } from 'use-context-selector';
import { ipcRenderer } from '../../helpers/safeIpc';
import { GlobalVolatileContext } from '../../helpers/contexts/GlobalNodeState';
import { InputProps } from './props';
import { useLastDirectory } from '../../helpers/hooks/useLastDirectory';

type DirectoryInputProps = InputProps;

const DirectoryInput = memo(
    ({ id, index, isLocked, useInputData, schemaId }: DirectoryInputProps) => {
        const isInputLocked = useContextSelector(GlobalVolatileContext, (c) =>
            c.isNodeInputLocked(id, index)
        );

        const [directory, setDirectory] = useInputData<string>(index);
        const { getLastDirectory, setLastDirectory } = useLastDirectory(`${schemaId} ${index}`);

        const onButtonClick = async () => {
            const { canceled, filePaths } = await ipcRenderer.invoke(
                'dir-select',
                directory ?? getLastDirectory() ?? ''
            );
            const path = filePaths[0];
            if (!canceled && path) {
                setDirectory(path);
                setLastDirectory(path);
            }
        };

        return (
            <InputGroup>
                <InputLeftElement pointerEvents="none">
                    <BsFolderPlus />
                </InputLeftElement>
                <Input
                    isReadOnly
                    isTruncated
                    className="nodrag"
                    cursor="pointer"
                    disabled={isLocked || isInputLocked}
                    draggable={false}
                    placeholder="Select a directory..."
                    value={directory ?? ''}
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onClick={onButtonClick}
                />
            </InputGroup>
        );
    }
);

export default DirectoryInput;