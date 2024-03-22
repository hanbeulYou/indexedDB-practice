import React, { useState } from 'react';
import './App.css';

type UserDataType = {
  name: string,
  age: string,
  email: string,
}

type UserDataWithIdType = UserDataType & {
  id: number,
}

function App() {
  const DEFAULT_USER_DATA = { name: '', age: '', email: '' }
  const DEFAULT_USER_DATA_WITH_ID = { ...DEFAULT_USER_DATA, id: 0 }
  const [userData, setUserData] = useState<UserDataType>(DEFAULT_USER_DATA);
  const [userGetData, setUserGetData] = useState<Array<UserDataWithIdType>>([DEFAULT_USER_DATA_WITH_ID]);
  const [userUpdateData, setUserUpdateData] = useState<UserDataWithIdType>(DEFAULT_USER_DATA_WITH_ID);

  if (!window.indexedDB) {
    window.alert(
      "Your browser doesn't support a stable version of IndexedDB",
    );
    return null;
  }

  // Open IndexedDB
  const request = indexedDB.open("userDB", 1);
  let db: IDBDatabase;

  request.onerror = () => {
    alert("IndexedDB Open Error!");
  };

  request.onsuccess = () => {
    db = request.result;
  };

  // Create ObjectStore 
  request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
    const upgradeDb = (event.target as IDBOpenDBRequest).result;
    const objectStore = upgradeDb.createObjectStore("user", { keyPath: "id", autoIncrement: true });
    objectStore.createIndex("email", "email", { unique: true });
  };
  
  // Add Data
  const addBtnHandler = () => {
    if(!userData.age || !userData.email || !userData.name) return alert("입력값을 모두 채워주세요");
    const store = db.transaction("user", "readwrite").objectStore("user");
    const addReq = store.add(userData);
    addReq.onsuccess = () => {
      console.log("Add Success!");
      setUserData(DEFAULT_USER_DATA);
    };
  };

  // Get Data by Key
  const getByIdBtnHandler = () => {
    const id = Number(prompt('ID를 입력하세요'));
    const store = db.transaction("user", "readonly").objectStore("user");
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (getReq.result as UserDataType) {
        console.log("Get Success!");
        setUserGetData([getReq.result]);
        return;
      }
      return alert('해당 ID가 존재하지 않습니다.'); 
    };
    getReq.onerror = () => {
      alert('해당 ID가 존재하지 않습니다.'); 
    };
  };

  // Get Data by Index
  const getByIndexBtnHandler = () => {
    const email = prompt('Email을 입력하세요')!;
    const store = db.transaction("user", "readonly").objectStore("user");
    const index = store.index("email");
    const getReq = index.get(email);
    getReq.onsuccess = () => {
      if (getReq.result as UserDataType) {
        console.log("Get Success!");
        setUserGetData([getReq.result]);
        return;
      }
      return alert('해당 이메일을 가진 사용자를 찾을 수 없습니다.'); 
    };
  };

  // Get All Data (data가 많아지면 IDBCursor을 활용해 Pagination 필요)
  const getAllBtnHandler = () => {
    const store = db.transaction("user", "readonly").objectStore("user");
    const getReq = store.getAll();
    getReq.onsuccess = () => {
      if (getReq.result as Array<UserDataType>) {
        console.log(getReq)
        setUserGetData(getReq.result);
        return;
      }
      return alert('데이터가 존재하지 않습니다.'); 
    };
  };

  // Update Data
  const updatedBtnHandler = () => {
    const store = db.transaction("user", "readwrite").objectStore("user");
    const putReq = store.put({...userUpdateData, id: +userUpdateData.id});
    putReq.onsuccess = () => {
      alert('데이터가 수정되었습니다.'); 
    };
    putReq.onerror = () => {
      alert('입력한 ID가 존재하지 않습니다.'); 
    };
  };

  // Delete Data
  const deleteBtnHandler = () => {
    const id = prompt('삭제할 ID를 입력하세요')!
    const store = db.transaction("user", "readwrite").objectStore("user");
    const deleteReq = store.delete(+id);
    deleteReq.onsuccess = () => {
      alert('데이터가 삭제되었습니다.'); 
    };
    deleteReq.onerror = () => {
      alert('입력한 ID가 존재하지 않습니다.'); 
    };
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserUpdateData({ ...userUpdateData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <div className="wrapper">
        <label>
          Email:
          <input name="email" type="email" value={userData.email} onChange={handleAddChange} />
        </label>
        <label>
          Name:
          <input name="name" type="text" value={userData.name} onChange={handleAddChange} />
        </label>
        <label>
          Age:
          <input name="age" type="number" value={userData.age} onChange={handleAddChange} />
        </label>
        <button onClick={addBtnHandler}>Add</button>
      </div>

      <div className="wrapper">
        <div className="buttonContainer">
          <button onClick={getByIdBtnHandler}>Get by ID</button>
          <button onClick={getByIndexBtnHandler}>Get by Email</button>
          <button onClick={getAllBtnHandler}>Get All</button>
          <button onClick={deleteBtnHandler}>Delete</button>
        </div>
        {userGetData && !!userGetData[0].id && 
          <div className="dataContainer">
            {userGetData.map((data, index) => (
              <div className="dataWrapper" key={index}>
                <div>
                  <span>ID: </span>
                  <span>{data.id}</span>
                </div>
                <div>
                  <span>Email: </span>
                  <span>{data.email}</span>
                </div>
                <div>
                  <span>Name: </span>
                  <span>{data.name}</span>
                </div>
                <div>
                  <span>Age: </span>
                  <span>{data.age}</span>
                </div>
              </div>
            )
          )}
          </div>
        }
      </div>

      <div className="wrapper">
        <label>
          ID:
          <input name="id" type="id" value={userUpdateData.id} onChange={handleUpdateChange}/>
        </label>
        <label>
          Email:
          <input name="email" type="email" value={userUpdateData.email} onChange={handleUpdateChange} />
        </label>
        <label>
          Name:
          <input name="name" type="text" value={userUpdateData.name} onChange={handleUpdateChange} />
        </label>
        <label>
          Age:
          <input name="age" type="number" value={userUpdateData.age} onChange={handleUpdateChange} />
        </label>
        <button onClick={updatedBtnHandler}>Update</button>
      </div>
    </div>
  );
}

export default App;
