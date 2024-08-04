import { Table } from 'antd';
import { Layout, Breadcrumb } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../util/api';

const {  Content } = Layout;
export const Dashboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state.auth.user);

    const getBills = async (token) => {
        setLoading(true);
        try {
            const response = await api.get('get-bills', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLoading(false);
            setData(response.data.bills)
        } catch (error) {
            setLoading(false);
            console.error('Error fetching bills:', error.message);
        }
    };

    useEffect(() => {
        const { token } = user
        if (user && token) {
            getBills(user.token);
        }
    }, [user]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'QTY',
            dataIndex: 'qty',
            key: 'qty',
        },
        {
            title: 'RATE(Rs.)',
            dataIndex: 'rate',
            key: 'rate',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
    ];
    return (
        <Layout style={{ padding: '0 24px 24px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>List</Breadcrumb.Item>
                <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb>
            <Content
                className="site-layout-background"
                style={{
                    padding: 24,
                    margin: 0,
                    minHeight: 280,
                }}
            >
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    rowKey="id"
                />
            </Content>
        </Layout>
    );
};
