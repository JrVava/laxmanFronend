import { Button, Table, Typography, Popconfirm, Layout, Breadcrumb, Input, DatePicker, Row, Col, Space } from 'antd';
import { EyeOutlined, EditOutlined, FileAddOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../util/api';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import useDocumentTitle from '../../hook/useDocumentTitle';

const { Content } = Layout;
const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

export const Listing = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const user = useSelector((state) => state.auth.user);
    const [grandTotal, setGrandTotal] = useState(0);
    const [errorMessage, setErrorMessage] = useState();

    const navigate = useNavigate();
    useDocumentTitle('Billing Listing');

    useEffect(() => {
        if (user && user.token) {
            getBills(user.token);
        }
    }, [user]);

    const getBills = async (token, params = {}) => {
        setLoading(true);
        try {
            const response = await api.get('get-bills', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params,
            });

            const formattedData = response.data.bills.map(bill => ({
                key: bill.billing_detail.id,
                id: bill.billing_detail.id,
                customer: {
                    title: bill.customer.title,
                    name: bill.customer.name,
                    location: bill.customer.location,
                },
                billing_detail: bill.billing_detail,
                billings: bill.billings.map(billing => ({
                    ...billing,
                    key: billing.id
                }))
            }));

            setData(formattedData);
            setFilteredData(formattedData); // Initialize filteredData with all data
        } catch (error) {
            console.error('Error fetching bills:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (searchValue,searchLocation, dateRange) => {
        const [startDate, endDate] = dateRange;
        const searchData = {
            customer_name: searchValue,
            location:searchLocation,
            start_date: startDate ? startDate.format('YYYY-MM-DD') : undefined,
            end_date: endDate ? endDate.format('YYYY-MM-DD') : undefined,
        };
        

        if (user && user.token) {
            try {
                const response = await api.post('/search-bill', searchData, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                if (response.data.error) {
                    setData([]);
                    setFilteredData([]);
                    setGrandTotal(0);
                    setErrorMessage(response.data.error);
                    return;
                }
                const formattedData = response.data.bills.map(bill => ({
                    key: bill.billing_detail.id,
                    id: bill.billing_detail.id,
                    customer: {
                        title: bill.customer.title,
                        name: bill.customer.name,
                        location: bill.customer.location,
                    },
                    billing_detail: bill.billing_detail,
                    billings: bill.billings.map(billing => ({
                        ...billing,
                        key: billing.id
                    }))
                }));

                setData(formattedData);
                setFilteredData(formattedData);
                setGrandTotal(+parseFloat(response.data.totalGrandTotal).toFixed(2));
                if (searchData.customer_name === '') {
                    setGrandTotal(0);
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setErrorMessage(error.response.data.error);
                } else {
                    setErrorMessage('Error searching bills: ' + error.message);
                }
                setData([]);
                setFilteredData([]);
                setGrandTotal(0);
            }
        }
    };

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        handleSearch(searchValue,searchLocation, dates);
    };
    const handleSearchValueChange = (e) => {
        const value = e.target.value;

        setSearchValue(value);
        handleSearch(value,searchLocation, dateRange);
    };

    const handleSearchLocationChange = (e) => {
        const inputLocation = e.target.value;

        setSearchLocation(inputLocation);
        handleSearch(searchValue,inputLocation, dateRange);
    };

    const handleReset = () => {
        setSearchValue('');
        setSearchLocation('');
        setDateRange([]);
        setGrandTotal(0);
        getBills(user.token); // Fetch all bills again
    };

    const handleView = (id) => {
        navigate(`/view-bill/${id}`);
    };

    const columns = [
        {
            title: 'Bill',
            key: 'sr',
            render: (text, record, index) => (
                <div>
                    #{record.billing_detail.id}
                </div>
            ),
        },
        {
            title: 'Date',
            key: 'date',
            render: (text, record, index) => (
                <div>
                    {moment(record.billing_detail.billing_date).format('DD MMMM, YYYY')}
                </div>
            ),
        },
        {
            title: 'Customer',
            key: 'customer',
            render: (text, record) => (
                <div>
                    {record.customer.title}. {record.customer.name}
                </div>
            ),
        },
        {
            title: 'Location',
            key: 'location',
            render: (text, record) => (
                <div>
                    {record.customer.location}
                </div>
            ),
        },
        {
            title: 'Amount',
            key: 'amount',
            render: (text, record) => (
                <div>
                    {record.billing_detail.grand_total}
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, bill) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(bill.id)}
                    >
                        View
                    </Button>

                    <Link to={`/edit-bill/${bill.id}`}>
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                        >
                            Edit
                        </Button>
                    </Link>
                </Space>
            ),
        },
    ];

    const expandedRowRender = (record) => {
        const billingDetail = record.billing_detail || {};
        const billings = record.billings || [];

        const billingColumns = [
            {
                title: 'Billing ID',
                dataIndex: 'id',
                key: 'id',
                render: (text, record, key) => (
                    <div>{key + 1}</div>
                ),
            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
            },
            {
                title: 'QTY',
                dataIndex: 'qty',
                key: 'quantity',
            },
            {
                title: 'Rate',
                dataIndex: 'rate',
                key: 'rate',
            },
            {
                title: 'Amount',
                dataIndex: 'amount',
                key: 'amount',
            },
            {
                title: 'Unit',
                dataIndex: 'unit',
                key: 'unit',
            },
        ];

        return (
            <div>
                <div style={{ marginBottom: 16 }}>
                    <Title level={4}>Billing Detail</Title>
                    <p><strong>Billing Date:</strong> {moment(billingDetail.billing_date).format('DD MMMM, YYYY')}</p>
                    <p><strong>Total:</strong> {billingDetail.grand_total - billingDetail.tax - billingDetail.packaging}</p>
                    <p><strong>GST:</strong> {billingDetail.tax}</p>
                    <p><strong>Packaging:</strong> {billingDetail.packaging}</p>
                    <p><strong>Grand Total:</strong> {billingDetail.grand_total}</p>
                </div>
                <Table
                    columns={billingColumns}
                    dataSource={billings}
                    pagination={false}
                    rowKey="key"
                />
            </div>
        );
    };

    const breadcrumbItems = [
        { title: 'Bills' }
    ];

    return (
        <Layout style={{ padding: '0 24px 24px' }}>
            <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />

            <Link to="/new-bill">
                <Button
                    type="primary"
                    shape="round"
                    size="large"
                    icon={<FileAddOutlined />}
                    style={{ marginBottom: 16 }}
                >
                    New Bill
                </Button>
            </Link>

            <Content
                className="site-layout-background"
                style={{
                    padding: 24,
                    margin: 0,
                    minHeight: 280,
                }}
            >
                <Row gutter={[16, 16]} justify="start">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Input
                            placeholder="Search by Customer Name"
                            value={searchValue}
                            onChange={handleSearchValueChange}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Input
                            placeholder="Search by Location"
                            value={searchLocation}
                            onChange={handleSearchLocationChange}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <RangePicker
                            format="YYYY-MM-DD"
                            onChange={handleDateRangeChange}
                            value={dateRange}
                            style={{ width: '100%' }}
                        />
                    </Col>

                    <Col xs={24} sm={12} md={4} lg={3}>
                        <Button
                            type="primary"
                            onClick={handleReset}
                            style={{ width: '100%' }}
                        >
                            Reset
                        </Button>
                    </Col>
                </Row>

                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        pagination={{ pageSize: 10 }}
                        loading={loading}
                        expandable={{ expandedRowRender }}
                        scroll={{ x: 800 }} // Makes the table scrollable horizontally on small screens
                        style={{ marginTop: 16 }}
                        locale={{
                            emptyText: errorMessage || 'No data available',
                        }}
                    />
                

                {grandTotal !== 0 && (
                    <div
                        dangerouslySetInnerHTML={{ __html: `<strong>Total:</strong> ${grandTotal}` }}
                    />
                )}
            </Content>
        </Layout>
    );
};
