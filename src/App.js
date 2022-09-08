import logo from './logo.svg';
import './App.css';
import React, {useCallback, useState, useEffect} from 'react';
import ASN1 from '@lapo/asn1js';
import Hex from '@lapo/asn1js/hex';
import DropArea from "./DropArea";


function App() {
  let initialState = localStorage.items ? JSON.parse(localStorage.items) : [];
  console.log('initialState',initialState)
  const [LSitems,setLSitems] = useState(initialState);
  const [choosedItem,setChoosedItem] = useState(null);

  useEffect(()=>{
    function storageUpdates(){
      console.log('storage triggered')
      const data = localStorage.getItem('items');
      if(data){
        setLSitems(JSON.parse(data));
      }
    }
    window.addEventListener("storage",storageUpdates);
    return () => {
      window.removeEventListener("storage",storageUpdates);
    };
  },[]);
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.map(async (file)=>{
      const fileInUint8Arr = await file.arrayBuffer().then(buff => new Uint8Array(buff));
      const result = ASN1.decode(fileInUint8Arr);
      const issuerCN = result.sub[0].sub[3].sub[2].sub[0].sub[1].content(100);
      const commonName = result.sub[0].sub[5].sub[3].sub[0].sub[1].content(100);
      const validFrom = result.sub[0].sub[4].sub[0].content(100).split(' ')[0];
      const validTill = result.sub[0].sub[4].sub[1].content(100).split(' ')[0];   
      console.log(issuerCN, ",", commonName, ",", validFrom, ",", validTill); 
      let tempArr = JSON.parse(localStorage.getItem('items')) || [];
      tempArr.push({issuerCN:issuerCN,commonName:commonName,validFrom:validFrom,validTill:validTill});
      localStorage.setItem('items', JSON.stringify(tempArr));
      setLSitems(tempArr); // added this because "StorageEvent is fired in different page with the same domain " - https://stackoverflow.com/questions/35865481/storage-event-not-firing

  })
  }, []);

  return (
    <div className="App">
      <DropArea onDrop={onDrop}/>
      <div className="mainTable">
        <div className='list'>
          {LSitems.map(certificate=>{
            return <li key={certificate.issuerCN} onClick={event=>setChoosedItem(certificate)} className="itemList">{certificate.issuerCN}</li>
          })}
        </div>
        <div className='infoArea'>  
        {
          choosedItem ? (
            Object.entries(choosedItem).map(arrEl=>{
              return <li key={arrEl[1]}>{arrEl[0]}:{arrEl[1]}</li>
            })
          ) : null
        }
        </div>
      </div>
    </div>
  );
}

export default App;