import React, { useState, memo, ReactNode } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { FiCloud } from 'react-icons/fi';

export type TurboNodeData = {
  title: string;
  icon?: ReactNode;
  subline?: string;
  chainnerData?: string;
  dataSetter?: (node_data: TurboNodeData) => null;
};

export default memo(({ id, data }: NodeProps<TurboNodeData>) => {
  const handleClick = () => {
      console.log(data);
      data.dataSetter?.(data)
  }
  return (
    <>
      <div className="cloud gradient">
        <div>
          <FiCloud />
        </div>
      </div>
      <div className="wrapper gradient">
        <div className="inner">
          <div className="body">
            {data.icon && <div className="icon" onClick={handleClick}>{data.icon}</div>}
            <div>
              <div className="title">{data.title}</div>
              {data.id && <div className="subline">{data.id}</div>}
            </div>
          </div>
          <Handle type="target" position={Position.Left} />
          <Handle type="source" position={Position.Right} />
        </div>
      </div>
    </>
  );
});
