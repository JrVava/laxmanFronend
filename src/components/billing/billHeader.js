import React from 'react';
import { Typography } from 'antd';
import dayjs from 'dayjs';

const { Paragraph } = Typography;

const BillHeader = ({ billing_detail, customer }) => (
    <div className="header-container">
        <div className="header-row">
            <Paragraph className="header-title">ON APPROVAL / DELIVERY CHALLAN</Paragraph>
        </div>
        <div className="header-row">
            <Paragraph className="header-title">MJ FASHION MUMBAI</Paragraph>
        </div>
        <div className="header-row header-content">
            <Paragraph>Bill #{billing_detail.id}</Paragraph>
            <Paragraph><strong>Billing Date:</strong> {dayjs(billing_detail.billing_date).format('YYYY-MM-DD')}</Paragraph>
        </div>
        <div className="header-row header-content">
            <Paragraph>Name: {customer.title}. {customer.name}</Paragraph>
            <Paragraph><strong>Location:</strong> {customer.location}</Paragraph>
        </div>
    </div>
);

export default BillHeader;
