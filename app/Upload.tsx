'use client';
import styles from '@/app/page.module.scss';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import uploadIcon from '@/public/upload.svg';
import deleteIcon from '@/public/delete.svg';
import KrakenFuturesAdapter from '@/app/KrakenFuturesAdapter';
import Papa, { ParseResult } from 'papaparse';
import { useAppDispatch } from '@/store/store';
import { addManyPositions, addPosition, deleteAllPositions } from '@/store/positionsSlice';


const UploadButton = function({
  file,
  setFile,
} : {
  file: Blob | null,
  setFile: Dispatch<SetStateAction<Blob | null>>,
}) {
  const [uploadBtnClicked, setUploadBtnClicked] = useState<boolean>(false);

  // ref hook used to choose file when any part of button is clicked
  const ref = (node: HTMLInputElement) => {
    if (!node) return;
    if (uploadBtnClicked) node.click();
    setUploadBtnClicked(false);
  };

  return (
    <button
      className={styles.app__container__upload__button}
      onClick={() => setUploadBtnClicked(true)}
    >
      <Image
        src={uploadIcon}
        alt='Upload'
      />
      <input
        ref={ref}
        id=''
        type='file'
        accept='.csv'
        onChange={event => {
          if (event.target && event.target.files) {
            setFile(event.target.files[0]);
          }
        }}
      />

    </button>
  );
}

const DeleteButton = function({
  setFile
} : {
  setFile: Dispatch<SetStateAction<Blob | null>>
}) {
  const [deleteBtnClicked, setDeleteBtnClicked] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  return (
    <button
      className={styles.app__container__upload__button}
      onClick={() => {
        setFile(null);
        dispatch(deleteAllPositions());
      }}
    >
      <Image
        src={deleteIcon}
        alt='Delete'
      />
    </button>
  );
}

const Upload = function({
  className
} : {
  className: string,
}) {
  const [file, setFile] = useState<Blob | null>(null);
  const dispatch = useAppDispatch();
  /*
  const selectPositions = (state : RootState) => state.positions
  const positions = useAppSelector(selectPositions);
  */
  useEffect(() => {
    if (file) {
      Papa.parse<Blob>(file, {
        delimiter: '',
        newline: '\n',
        header: true,
        complete: (results: ParseResult<Blob>) => {
          const lines = [...results.data]
          const positions = KrakenFuturesAdapter.processCsvData(lines);
          dispatch(addManyPositions(positions));
        },
        error: (error: Error) => {
          throw error;
        },
        skipEmptyLines: true,
      });
    }
  }, [file])
  return (
    <div className={className}>
      <span id={styles.fontLighter}>Choose file:</span>
      <span id={styles.fontBold}>{ 
        file ? file.name : ''
      }</span>
      { file? 
        <DeleteButton
          setFile={setFile}
        />
        :
        <UploadButton
          file={file}
          setFile={setFile}
        />
      }
    </div>
  );
};

export default Upload;
