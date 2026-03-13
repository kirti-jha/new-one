export type BlogHighlight = {
  title: string;
  desc: string;
};

export type BlogPost = {
  id: string;
  img: string;
  tag: string;
  title: string;
  author: string;
  date: string;
  time: string;
  comments: number;
  content: string[];
  whyChoose: string[];
  highlights: BlogHighlight[];
  related: number[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    "id": "how-the-right-insurance-plan-builds-long-term-financial-security",
    "img": "https://fintekdiary.com/wp-content/uploads/2022/11/close-up-hand-putting-money-coins-stack-saving-money-growing-business-concept-1300x731-1.jpg",
    "tag": "INSURANCE",
    "title": "How the Right Insurance Plan Builds Long-Term Financial Security",
    "author": "Abheepay Team",
    "date": "2025",
    "time": "3 min read",
    "comments": 2,
    "content": [
      "Insurance plays a vital role in protecting individuals from financial uncertainty.",
      "Health, life, and general insurance plans provide a safety net during emergencies.",
      "Digital insurance services have simplified policy selection, renewal, and claim processes."
    ],
    "whyChoose": [
      "Quick policy comparison",
      "Paperless documentation",
      "Trusted insurance providers",
      "Simple claim assistance"
    ],
    "highlights": [
      { "title": "Risk Protection", "desc": "Financial safety during emergencies." },
      { "title": "Digital Access", "desc": "Easy online policy management." },
      { "title": "Future Ready", "desc": "Long-term family security." }
    ],
    "related": [1, 2]
  },
  {
    "id": "why-digital-credit-card-bill-payments-are-safer-than-cash",
    "img": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80\u0026w=1000\u0026auto=format\u0026fit=crop",
    "tag": "PAYMENTS",
    "title": "Why Digital Credit Card Bill Payments are Safer Than Cash",
    "author": "Abheepay Team",
    "date": "2025",
    "time": "2 min read",
    "comments": 1,
    "content": [
      "Digital bill payments reduce the risk of missed deadlines and penalties.",
      "Instant confirmation and secure gateways make transactions reliable.",
      "Retailers and customers both benefit from transparent payment records."
    ],
    "whyChoose": [
      "Real-time transaction updates",
      "Highly secure payment gateways",
      "Zero paperwork",
      "24/7 payment availability"
    ],
    "highlights": [
      { "title": "Security", "desc": "Encrypted digital transactions." },
      { "title": "Speed", "desc": "Instant payment confirmation." },
      { "title": "Convenience", "desc": "Pay anytime, anywhere." }
    ],
    "related": [0, 3]
  },
  {
    "id": "digital-banking-solutions-empowering-small-businesses",
    "img": "https://fintekdiary.com/wp-content/uploads/2023/01/working-computer-graphing-cryptocurrenciesfinance-background-1300x731-1.jpg",
    "tag": "DIGITAL BANKING",
    "title": "Digital Banking Solutions Empowering Small Businesses",
    "author": "Abheepay Team",
    "date": "2025",
    "time": "4 min read",
    "comments": 3,
    "content": [
      "Digital banking has transformed how small businesses manage money.",
      "Services like fund transfers, balance tracking, and transaction history are now instant.",
      "This shift enables businesses to save time and improve cash flow management."
    ],
    "whyChoose": [
      "Fast fund transfers",
      "Better record keeping",
      "Improved cash flow",
      "Secure digital banking access"
    ],
    "highlights": [
      { "title": "Efficiency", "desc": "Quick and easy money management." },
      { "title": "Transparency", "desc": "Clear transaction history." },
      { "title": "Growth", "desc": "Supports better cash flow decisions." }
    ],
    "related": [1, 4]
  },
  {
    "id": "smart-cash-flow-management-for-growing-retailers",
    "img": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80\u0026w=1000\u0026auto=format\u0026fit=crop",
    "tag": "BUSINESS",
    "title": "Smart Cash Flow Management for Growing Retailers",
    "author": "Abheepay Team",
    "date": "2025",
    "time": "3 min read",
    "comments": 4,
    "content": [
      "Retailers can grow faster when cash flow is managed efficiently.",
      "Tracking daily inflow and outflow helps avoid sudden shortages.",
      "Digital tools make record keeping easier and reduce manual errors."
    ],
    "whyChoose": [
      "Track daily income",
      "Manage expenses better",
      "Avoid cash crunch",
      "Improve profitability"
    ],
    "highlights": [
      { "title": "Planning", "desc": "Better financial decision making." },
      { "title": "Control", "desc": "Track and optimize spending." },
      { "title": "Stability", "desc": "Reduced risk of shortages." }
    ],
    "related": [2, 5]
  },
  {
    "id": "utility-bill-payments-a-convenient-digital-experience",
    "img": "https://images.unsplash.com/photo-1556742400-b5b7c5121f44?q=80\u0026w=1000\u0026auto=format\u0026fit=crop",
    "tag": "BBPS",
    "title": "Utility Bill Payments: A Convenient Digital Experience",
    "author": "Abheepay Team",
    "date": "2024",
    "time": "2 min read",
    "comments": 2,
    "content": [
      "Utility bill payments are now quick and hassle-free with digital platforms.",
      "Customers can pay electricity, gas, water, and other bills instantly.",
      "Retailers offering bill payment services can increase footfall and customer trust."
    ],
    "whyChoose": [
      "Instant bill payments",
      "Multiple utility coverage",
      "Secure and reliable",
      "Higher customer satisfaction"
    ],
    "highlights": [
      { "title": "Convenience", "desc": "Pay bills in minutes." },
      { "title": "Coverage", "desc": "Multiple utilities supported." },
      { "title": "Trust", "desc": "Secure BBPS powered payments." }
    ],
    "related": [4, 7]
  },
  {
    "id": "how-digital-loan-services-help-businesses-scale-faster",
    "img": "https://fintekdiary.com/wp-content/uploads/2022/11/focused-indian-young-couple-accounting-calculating-bills-discussing-planning-budget-together-using-online-banking-services-calculator-checking-finances-1300x731-1.jpg",
    "tag": "LOANS",
    "title": "How Digital Loan Services Help Businesses Scale Faster",
    "author": "Abheepay Team",
    "date": "2024",
    "time": "3 min read",
    "comments": 5,
    "content": [
      "Digital loan services offer quick access to working capital.",
      "Minimal documentation and faster approvals reduce business downtime.",
      "These services empower entrepreneurs to expand without financial stress."
    ],
    "whyChoose": [
      "Quick loan approval",
      "Minimal documentation",
      "Flexible repayment options",
      "Transparent process"
    ],
    "highlights": [
      { "title": "Speed", "desc": "Faster access to funds." },
      { "title": "Flexibility", "desc": "Business-friendly repayment plans." },
      { "title": "Growth", "desc": "Support for expansion plans." }
    ],
    "related": [5, 7]
  },
  {
    "id": "how-digital-financial-services-increase-retail-store-footfall",
    "img": "https://fintekdiary.com/wp-content/uploads/2023/02/real-estate-agent-working-table-1300x731-1.jpg",
    "tag": "RETAIL SERVICES",
    "title": "How Digital Financial Services Increase Retail Store Footfall",
    "author": "Abheepay Team",
    "date": "2024",
    "time": "3 min read",
    "comments": 6,
    "content": [
      "Retailers offering digital services attract more daily customers.",
      "Services like bill payments, banking, and insurance build customer trust.",
      "This results in increased income opportunities and stronger customer relationships."
    ],
    "whyChoose": [
      "Multiple service offerings",
      "Higher customer engagement",
      "Additional income streams",
      "Stronger brand trust"
    ],
    "highlights": [
      { "title": "Footfall", "desc": "More customers daily." },
      { "title": "Revenue", "desc": "Extra earning opportunities." },
      { "title": "Trust", "desc": "Reliable digital services." }
    ],
    "related": [6, 0]
  }
];

export function getBlogPost(blogId: string) {
  return BLOG_POSTS.find((p) => p.id === blogId) || null;
}

export function getRelatedBlogPosts(post: BlogPost) {
  const maxIndex = BLOG_POSTS.length - 1;
  const indices = Array.isArray(post.related) ? post.related : [];
  const valid = indices
    .filter((i) => Number.isInteger(i) && i >= 0 && i <= maxIndex)
    .filter((i) => BLOG_POSTS[i]?.id !== post.id);
  return valid.map((i) => BLOG_POSTS[i]).filter(Boolean);
}

