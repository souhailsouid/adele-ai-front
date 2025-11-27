// NextJS Material Dashboard 2 PRO components
import MDBadge from "/components/MDBadge";

const campaignsData = {
  columns: [
    { Header: "Name", accessor: "campaignName"},
    { 
      Header: "Status", 
      accessor: "campaignStatus",
      Cell: ({ value }) => {
        let color;
        let variant = "gradient";
        switch (value) {
          case "Active":
            color = "success";
            break;
          case "Inactive":
            color = "error";
            break;
          case "Pending":
            color = "warning";
            break;
          case "Draft":
            color = "dark";
            break;
          default:
            color = "dark";
            break;
        }

        return (
          <MDBadge 
            badgeContent={value} 
            color={color} 
            variant={variant}
            size="sm"
            container 
          />
        );
      }
    },
    { Header: "Contacts", accessor: "contacts" },
    { Header: "Sent Date", accessor: "campaignSentDate" },

  ],

  rows: [
    {
      campaignName: "Campaign 1",
      campaignStatus: "Active",
      contacts: 100,
      campaignSentDate: "4/11/2021",
    },

    {
      campaignName: "Campaign 2",
      campaignStatus: "Inactive",
      contacts: 50,
      campaignSentDate: "4/11/2023",
    },
    {
      campaignName: "Campaign 3",
      campaignStatus: "Pending",
      contacts: 20,
      campaignSentDate: "4/10/2021",
    },
    {
      campaignName: "Campaign 4",
      campaignStatus: "Draft",
      contacts: 20,
      campaignSentDate: "10/11/2021",
    },
  ],
};

export default campaignsData;
