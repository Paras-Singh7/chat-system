import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { ServerD } from "../../@types/server";


interface ServerChannelsProps {
  data: ServerD[];
}

const ServerChannels = (props: ServerChannelsProps) => {
  const { data } = props;
  const theme = useTheme();
  const {serverId} = useParams();
  const serverName = data?.[0]?.name ?? "Server";


  return (
    <>
      <Box
        sx={{
          height: "50px",
          display: "flex",
          alignItems: "center",
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: "sticky",
          top: 1,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Typography
          variant="body1"
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {serverName}
        </Typography>
      </Box>
      <List sx={{ py: 0 }}>
        {data.flatMap((obj) =>
          obj.channel_server.map((item) => (
            <ListItem
              disablePadding
              key={item.id}
              sx={{ display: "block", maxHeight: "40px" }}
              dense={true}
            >
              <Link
                to={`/server/${serverId}/${item.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <ListItemButton sx={{ minHeight: 48 }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        textAlign="start"
                        paddingLeft={1}
                      >
                        {item.name}
                      </Typography>
                    }
                  ></ListItemText>
                </ListItemButton>
              </Link>
            </ListItem>
          ))
        )}
      </List>
    </>
  );
};

export default ServerChannels;
