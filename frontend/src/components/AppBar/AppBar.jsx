import Box from "@mui/material/Box";
import ModeSelect from "~/components/ModeSelect/ModeSelect";
import AppsIcon from "@mui/icons-material/Apps";
import { ReactComponent as TrelloIcon } from "~/assets/trello.svg";
import SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import Workspaces from "./Menus/Workspaces";
import Recent from "./Menus/Recent";
import Starred from "./Menus/Starred";
import Templates from "./Menus/Templates";
import Profiles from "./Menus/Profiles";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import { Link } from "react-router-dom";
import Notifications from "./Notifications/Notifications";
import AutoCompleteSearchBoard from "./SearchBoards/AutoCompleteSearchBoard";
import { alpha } from "@mui/material/styles";

function AppBar() {
  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        height: theme.trello.appBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        paddingX: 2.4,
        overflowX: "auto",
        color: "white",
        background: `linear-gradient(120deg, ${alpha(
          theme.palette.common.black,
          0.68
        )}, ${alpha(theme.palette.primary.dark, 0.48)})`,
        borderBottom: `1px solid ${alpha("#fff", 0.14)}`,
        boxShadow: "0 18px 50px rgba(0,0,0,0.32)",
        backdropFilter: "blur(16px)",
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Link to="/boards">
          <Tooltip title="Danh sách board">
            <AppsIcon sx={{ color: "white", verticalAlign: "middle" }} />
          </Tooltip>
        </Link>

        <Link to="/">
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <SvgIcon
              component={TrelloIcon}
              fontSize="small"
              inheritViewBox
              sx={{ color: "white" }}
            />
            <Typography
              variant="span"
              sx={{ fontSize: "1.2rem", fontWeight: "bold", color: "white" }}
            >
              Smart Task
            </Typography>
          </Box>
        </Link>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Tìm kiếm nhanh một hoặc nhiều cái board */}
        <AutoCompleteSearchBoard />

        {/* Dark - Light - System modes */}
        <ModeSelect />

        {/* Xử lý hiển thị các thông báo - notifications ở đây */}
        <Notifications />

        <Tooltip title="Trợ giúp">
          <HelpOutlineIcon sx={{ cursor: "pointer", color: "white" }} />
        </Tooltip>

        <Profiles />
      </Box>
    </Box>
  );
}

export default AppBar;
