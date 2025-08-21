import React from 'react';
import Tooltip from './Tooltip';

interface ViewSwitcherProps {
  isTableView: boolean;
  setIsTableView: (isTable: boolean) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ isTableView, setIsTableView }) => {
  return (
    <div className="bg-white rounded-lg border border-border-gray overflow-hidden">
      <div className="flex">
                        <Tooltip content="View data in a sortable table format">
                  <button
                    onClick={() => setIsTableView(true)}
                    className={`px-3 py-2.5 text-sm font-dm-sans transition-colors duration-150 ${
                      isTableView
                        ? 'bg-[rgba(25,90,254,0.1)] text-primary-blue'
                        : 'bg-white text-text-dark'
                    }`}
                  >
                    Metric Table
                  </button>
                </Tooltip>
                <div className="flex items-center justify-center">
                  <div className="w-px h-full bg-border-gray" />
                </div>
                <Tooltip content="View data as an interactive line chart">
                  <button
                    onClick={() => setIsTableView(false)}
                    className={`px-3 py-2.5 text-sm font-dm-sans transition-colors duration-150 ${
                      !isTableView
                        ? 'bg-[rgba(25,90,254,0.1)] text-primary-blue'
                        : 'bg-white text-text-dark'
                    }`}
                  >
                    Share Graph
                  </button>
                </Tooltip>
      </div>
    </div>
  );
};

export default ViewSwitcher;
