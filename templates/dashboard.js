import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import Table from '../components/table';

function Dashboard() {
    const [getBudget, setBudget] = useState({
        datasets: [
            {
                data: [],
                backgroundColor: []
            }
        ],
        labels: []
    });
    const [getItemName, setItemName] = useState("");
    const [getItemValue, setItemValue] = useState("");
    const [getItemExpense, setItemExpense] = useState("");
    const [getExpenseBudget, setExpenseBudget] = useState({
        datasets: [
            {
                data: [],
                backgroundColor: []
            }
        ],
        labels: []
    })
    const [getTableData, setTableData] = useState([]);

    const columns = [
        {
            Header: 'Name',
            accessor: 'name',
        },
        {
            Header: 'Budget',
            accessor: 'budget',
        },
        {
            Header: 'Expense',
            accessor: 'expense',
        },
        {
            Header: 'Net',
            accessor: 'net'
        }
    ];

    const settingItemName = (event) => {
        setItemName(event.target.value);
    };
    
    const settingItemValue = (event) => {
        setItemValue(event.target.value);
    };

    const settingItemExpense = (event) => {
        setItemExpense(event.target.value);
    }


    const addBudgetItem = (event) => {
        event.preventDefault();
        if (getItemName === "" || getItemValue <= 0) {
            return;
        }
        const token = localStorage.getItem("tkn");
        var color = "#" + Math.floor(Math.random()*16777215).toString(16);

        axios.post(`PORT` {getItemName, getItemValue, color, getItemExpense},{headers: {Authorization: `Bearer ${token}`}})
        .then((res) => {
            updateData(res);
            setItemName("");
            setItemValue("");
            setItemExpense("");
        })
        .catch((err) => {
            console.log(err);
        });
    };

    const updateData = (res) => {
        let tempBud = {
            datasets: [
                {
                    label: '',
                    data: [],
                    backgroundColor: []
                }
            ],
            labels: []
        };
        let tempExp = {
            datasets: [
                {
                    label: '',
                    data: [],
                    backgroundColor: []
                }
            ],
            labels: []
        };
        let tempTable = [];

        for (var i = 0; i < res.data.budget.length; i++) {
            tempBud.datasets[0].data[i] = res.data.budget[i].value;
            tempBud.labels[i] = res.data.budget[i].title;
            tempBud.datasets[0].backgroundColor[i] = res.data.budget[i].color;
            
            tempExp.datasets[0].data[i] = res.data.budget[i].expense;
            tempExp.labels[i] = res.data.budget[i].title;
            tempExp.datasets[0].backgroundColor[i] = res.data.budget[i].color;

            tempTable.push({
                name: res.data.budget[i].title,
                budget: "$" + res.data.budget[i].value,
                expense: "$" + res.data.budget[i].expense,
                net: "$" + (res.data.budget[i].value - res.data.budget[i].expense)
            });
        }
        setBudget(tempBud);
        setExpenseBudget(tempExp);
        setTableData(tempTable);
    }

    return (
        <section>
            <div className="page">
                <div className="wrapper">
                    <div className="content-wrapper">
                        <div className="content">
                            <div className="leftFloater">
                                {getBudget.length === 0 ? (
                                    <h2 className="centerAlign">No Budgets Added</h2>
                                ) : (
                                    <>
                                    <section className="charts">
                                        <br/>
                                        <div>
                                            <h3>Budget</h3>
                                            <div style={{width: "200px"}}>
                                                <Pie data={getBudget} width={200} height={200} />
                                            </div>
                                        </div>
                                        <div>
                                            <h3>Expense</h3>
                                            <div style={{width: "200px"}}>
                                                <Pie data={getExpenseBudget} width={200} height={200} />
                                            </div>
                                        </div>
                                    </section>
                                    <section className="charts">
                                        <div>
                                            <h3>Budget</h3>
                                            <div style={{width: "200px"}}>
                                                <Bar data={getBudget} width={200} height={200} />
                                            </div>
                                        </div>
                                        <div>
                                            <h3>Expense</h3>
                                            <div style={{width: "200px"}}>
                                                <Bar data={getExpenseBudget} width={200} height={200} />
                                            </div>
                                        </div>
                                    </section>
                                    <br />
                                    <section>
                                        <h2>Table</h2>
                                        <Table columns={columns} data={getTableData} />
                                    </section>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="sidebar">
                        <div className="rightFloater">
                            <section>
                                <h2>Add new budget item</h2>
                                <form onSubmit={addBudgetItem}>
                                    <label>Name</label>
                                    <br />
                                    <input type="text" value={getItemName} onChange={settingItemName} />
                                    <br />
                                    <label>Budget</label>
                                    <br />
                                    <input type="number" min="0" value={getItemValue} onChange={settingItemValue} />
                                    <br />
                                    <label>Expense</label>
                                    <br />
                                    <input type="number" min="0" value={getItemExpense} onChange={settingItemExpense} />
                                    <br />
                                    <input type="submit" value="Add" id="add" />
                                </form>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Dashboard;