import React, { useEffect, useState } from 'react';
// import { ToggleButton } from '@extension/ui';
// import { exampleThemeStorage } from '@extension/storage';
// import { t } from '@extension/i18n';
import { attachButtons, findPublishButton, handleCopyClick, handleDownloadClick } from '@utils/content-func';
import { cn, MessageIndicator, MessageIndicatorProps, ToggleButton } from '@extension/ui';

export default function App() {
  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    console.log('content ui loaded');
    // Observe DOM for dynamically added Publish buttons
    // const g = Cookies.
    new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          const pubBtn = findPublishButton();
          if (pubBtn) attachButtons(pubBtn);
          // setRendered(true)
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }, []);

  useEffect(() => {
    const checkCodeViewer = () => {
      const codeViewerExists = !!document.querySelector('button[aria-label="Code viewer"]');
      if (codeViewerExists) {
        setRendered(true);
        return true;
      }
      return false;
    };

    if (!checkCodeViewer()) {
      const interval = setInterval(() => {
        if (checkCodeViewer()) {
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    }
    return () => {}; // Return empty cleanup function for the other path
  }, []);

  if (!rendered) return <p>Loading...</p>;

  return (
    <div
      className={cn(
        // 'dark',
        'flex-col absolute bottom-5 right-8 z-[9999] flex items-center gap-2 rounded',
        'py-4',
      )}>
      <PopWindow />
    </div>
  );

  return (
    <div className="  flex items-center justify-between gap-2 rounded bg-blue-100 px-2 py-1">
      <div className="flex gap-1 text-blue-500">
        Edit <strong className="text-blue-700">pages/content-ui/src/app.tsx</strong> and save to reload.
      </div>
      {/* <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton> */}
    </div>
  );
}

type PopWindowProps = {
  className?: string;
};

const PopWindow = (props: PopWindowProps) => {
  const [enableCopy, setEnableCopy] = useState(false);

  useEffect(() => {
    function updateCopyState() {
      const enabled =
        document.querySelector('button[aria-label="Code viewer"]')?.getAttribute('aria-pressed') === 'true';
      setEnableCopy(enabled || false);
    }

    // Initial state
    updateCopyState();

    // Watch for clicks on the Code viewer button
    const codeViewer = document.querySelector('button[aria-label="Code viewer"]');
    codeViewer?.addEventListener('click', () => {
      setTimeout(updateCopyState, 0);
    });

    return () => {
      codeViewer?.removeEventListener('click', updateCopyState);
    };
  }, []);

  interface ProcessingType {
    message: string;
    type: MessageIndicatorProps['type'];
  }

  const [processing, setProcessing] = useState<{
    copy?: ProcessingType;
    download?: ProcessingType;
  }>({});

  const handleCopy = async () => {
    setProcessing({
      ...processing,
      copy: {
        message: 'Copying...',
        type: 'loading',
      },
    });

    try {
      // make fake delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      await handleCopyClick();
      setProcessing({
        ...processing,
        copy: {
          message: 'Copied.',
          type: 'success',
        },
      });
    } catch (error) {
      console.error('Error copying code:', error);
      setProcessing({
        ...processing,
        copy: {
          message: 'Error copying code.',
          type: 'error',
        },
      });
    } finally {
      setTimeout(() => {
        setProcessing({ ...processing, copy: undefined });
      }, 1000);
    }
  };

  const handleDownload = async () => {
    setProcessing({
      ...processing,
      download: {
        message: 'Downloading...',
        type: 'loading',
      },
    });
    try {
      await handleDownloadClick();
      setProcessing({
        ...processing,
        download: {
          message: 'Downloaded.',
          type: 'success',
        },
      });
    } catch (error) {
      console.error('Error downloading code:', error);
      setProcessing({
        ...processing,
        download: {
          message: 'Error downloading code. Retry!',
          type: 'error',
        },
      });
    } finally {
      setTimeout(() => {
        setProcessing({ ...processing, download: undefined });
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col gap-2 justify-end items-end h-fit transform transition-all duration-200 ease-out">
      <button
        id="lvb-copy-btn"
        disabled={!enableCopy || processing.copy !== undefined}
        onClick={handleCopy}
        // className='inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none bg-secondary text-secondary-foreground shadow-sm hover:bg-muted-hover h-7 px-1 rounded-md py-1 aspect-square'
        className={cn(
          'hover:bg-opacity-85 p-2 gap-1 rounded-md aspect-square disabled:opacity-50 flex items-center justify-center bg-blue-600 text-white font-bold  transit</svg>ion-colors duration-300 ease-out',
          '',
        )}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-white" fill="none" viewBox="0 0 24 24">
          <path
            d="M17.5 14H19C20.1046 14 21 13.1046 21 12V5C21 3.89543 20.1046 3 19 3H12C10.8954 3 10 3.89543 10 5V6.5M5 10H12C13.1046 10 14 10.8954 14 12V19C14 20.1046 13.1046 21 12 21H5C3.89543 21 3 20.1046 3 19V12C3 10.8954 3.89543 10 5 10Z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Copy */}
      </button>

      <button
        id="lvb-download-btn"
        disabled={processing.download !== undefined}
        onClick={handleDownload}
        // className='inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outlin</svg>e-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none bg-secondary text-secondary-foreground shadow-sm hover:bg-muted-hover h-7 px-1 rounded-md py-1 aspect-square'
        className={cn(
          'hover:bg-opacity-85 p-2 gap-1 rounded-md aspect-square disabled:opacity-50 flex items-center justify-center bg-blue-600 text-white font-bold  transition-colors duration-300 ease-out',
          '',
        )}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-white" fill="none" viewBox="0 0 24 24">
          <path
            d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15"
            stroke="inherit"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 3V16M12 16L16 11.625M12 16L8 11.625"
            stroke="inherit"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Download Code */}
      </button>

      <div className="inline-block relative group hidden">
        <button
          className="hover:bg-opacity-85 flex items-center justify-center bg-blue-600 text-white font-bold h-7 w-fit p-2 py-4 gap-1 rounded-md transition-colors duration-300 ease-out"
          aria-label="Open popup">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Copyable
        </button>

        <div
          className="absolute right-5 bottom-full mb-1 w-48 p-4 bg-white border border-gray-200 rounded-md shadow-md \
                 transform transition-all duration-200 ease-out \
                 opacity-0 scale-95 invisible pointer-events-none \
                 group-hover:opacity-100 group-hover:scale-100 group-hover:visible group-hover:pointer-events-auto">
          <ul className="space-y-2 text-gray-700">
            <li>Popup Item 1</li>
            <li>Popup Item 2</li>
            <li>Popup Item 3</li>
          </ul>
        </div>
      </div>

      <div className="min-h-8">
        {processing.copy && <MessageIndicator type={processing.copy.type} message={processing.copy.message} />}

        {processing.download && (
          <MessageIndicator type={processing.download.type} message={processing.download.message} />
        )}
      </div>
    </div>
  );
};
