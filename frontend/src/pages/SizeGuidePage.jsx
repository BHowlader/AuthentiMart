import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Ruler, Info } from 'lucide-react'
import SEO from '../components/SEO'
import './StaticPages.css'

const SizeGuidePage = () => {
    const [activeCategory, setActiveCategory] = useState('clothing')

    const sizeCharts = {
        clothing: {
            title: "Women's Clothing",
            description: "Use these measurements to find your perfect fit. Measure yourself and compare with the chart below.",
            headers: ['Size', 'Bust (in)', 'Waist (in)', 'Hips (in)', 'Bust (cm)', 'Waist (cm)', 'Hips (cm)'],
            rows: [
                ['XS', '31-32', '23-24', '33-34', '79-81', '58-61', '84-86'],
                ['S', '33-34', '25-26', '35-36', '84-86', '64-66', '89-91'],
                ['M', '35-36', '27-28', '37-38', '89-91', '69-71', '94-97'],
                ['L', '37-39', '29-31', '39-41', '94-99', '74-79', '99-104'],
                ['XL', '40-42', '32-34', '42-44', '102-107', '81-86', '107-112'],
                ['XXL', '43-45', '35-37', '45-47', '109-114', '89-94', '114-119']
            ]
        },
        mens: {
            title: "Men's Clothing",
            description: "Find your size using chest, waist, and hip measurements.",
            headers: ['Size', 'Chest (in)', 'Waist (in)', 'Hips (in)', 'Chest (cm)', 'Waist (cm)', 'Hips (cm)'],
            rows: [
                ['S', '34-36', '28-30', '35-37', '86-91', '71-76', '89-94'],
                ['M', '38-40', '32-34', '38-40', '97-102', '81-86', '97-102'],
                ['L', '42-44', '36-38', '41-43', '107-112', '91-97', '104-109'],
                ['XL', '46-48', '40-42', '44-46', '117-122', '102-107', '112-117'],
                ['XXL', '50-52', '44-46', '47-49', '127-132', '112-117', '119-124']
            ]
        },
        shoes: {
            title: 'Shoe Sizes',
            description: 'Measure your foot length and compare with the chart below.',
            headers: ['BD Size', 'UK Size', 'US Size', 'EU Size', 'Foot Length (cm)'],
            rows: [
                ['36', '3', '5', '36', '22.5'],
                ['37', '4', '6', '37', '23.5'],
                ['38', '5', '7', '38', '24'],
                ['39', '6', '8', '39', '24.5'],
                ['40', '7', '9', '40', '25.5'],
                ['41', '8', '10', '41', '26'],
                ['42', '9', '11', '42', '27'],
                ['43', '10', '12', '43', '27.5'],
                ['44', '11', '13', '44', '28.5']
            ]
        },
        bags: {
            title: 'Bag Sizes',
            description: 'Reference dimensions for different bag sizes.',
            headers: ['Size', 'Width (in)', 'Height (in)', 'Depth (in)', 'Width (cm)', 'Height (cm)', 'Depth (cm)'],
            rows: [
                ['Mini', '6-8', '4-6', '2-3', '15-20', '10-15', '5-8'],
                ['Small', '9-11', '6-8', '3-4', '23-28', '15-20', '8-10'],
                ['Medium', '12-14', '9-11', '4-5', '30-36', '23-28', '10-13'],
                ['Large', '15-17', '12-14', '5-6', '38-43', '30-36', '13-15'],
                ['X-Large', '18+', '15+', '6+', '46+', '38+', '15+']
            ]
        }
    }

    const currentChart = sizeCharts[activeCategory]

    return (
        <div className="static-page">
            <SEO
                title="Size Guide"
                description="Find your perfect fit with AuthentiMart's comprehensive size charts for clothing, shoes, and bags. Measurements in inches and centimeters."
                keywords="size guide, size chart, clothing sizes, shoe sizes, measurements, AuthentiMart sizing"
                url="/size-guide"
            />
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/">Home</Link>
                    <ChevronRight size={16} />
                    <span>Size Guide</span>
                </nav>

                <div className="static-page-content">
                    <h1 className="static-page-title">Size Guide</h1>
                    <p className="static-page-subtitle">
                        Find your perfect fit with our comprehensive size charts. All measurements are in inches and centimeters.
                    </p>

                    {/* How to Measure */}
                    <div className="measure-tips glass-card">
                        <div className="measure-icon">
                            <Ruler size={32} />
                        </div>
                        <div className="measure-content">
                            <h3>How to Measure</h3>
                            <ul>
                                <li><strong>Bust/Chest:</strong> Measure around the fullest part of your bust/chest, keeping the tape horizontal.</li>
                                <li><strong>Waist:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</li>
                                <li><strong>Hips:</strong> Measure around the fullest part of your hips, about 8 inches below your waistline.</li>
                                <li><strong>Foot Length:</strong> Stand on a piece of paper and trace your foot. Measure from heel to longest toe.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="size-tabs">
                        {Object.keys(sizeCharts).map((key) => (
                            <button
                                key={key}
                                className={`size-tab ${activeCategory === key ? 'active' : ''}`}
                                onClick={() => setActiveCategory(key)}
                            >
                                {sizeCharts[key].title}
                            </button>
                        ))}
                    </div>

                    {/* Size Chart */}
                    <div className="size-chart-container glass-card">
                        <h2>{currentChart.title}</h2>
                        <p className="chart-description">{currentChart.description}</p>

                        <div className="size-chart-wrapper">
                            <table className="size-chart">
                                <thead>
                                    <tr>
                                        {currentChart.headers.map((header, index) => (
                                            <th key={index}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentChart.rows.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex}>{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="size-tips">
                        <div className="tip-card glass-card">
                            <Info size={24} />
                            <div>
                                <h4>Between Sizes?</h4>
                                <p>If you're between sizes, we recommend sizing up for a more comfortable fit, especially for clothing that doesn't stretch.</p>
                            </div>
                        </div>
                        <div className="tip-card glass-card">
                            <Info size={24} />
                            <div>
                                <h4>Product-Specific Sizing</h4>
                                <p>Some products may have specific sizing information on their product pages. Always check the product description for any variations.</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact CTA */}
                    <div className="cta-section glass-card">
                        <h2>Need Help Finding Your Size?</h2>
                        <p>Our customer service team can help you find the perfect fit. Don't hesitate to reach out!</p>
                        <div className="cta-buttons">
                            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
                            <Link to="/faq" className="btn btn-secondary">View FAQ</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SizeGuidePage
